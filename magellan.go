package magellan

import (
	"context"
	"errors"
	"sync"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/encoding"
	"github.com/rgraphql/magellan/execution"
	"github.com/rgraphql/magellan/result"
	"github.com/rgraphql/magellan/schema"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

// PathCacheSize determines how large the shared client-server path cache should be.
var PathCacheSize uint32 = 100

// ResultBufferSize determines how large the buffer for outgoing results should be.
var ResolverBufferSize uint32 = 50

// Server is a instance of a Magellan schema and resolver tree.
type Server struct {
	schema *schema.Schema
}

// ServerSendChan is a channel used to send updates to a remote client.
// This should be sufficiently buffered, as internally resolver processing will
// halt until new messages are writable to the channel (after an internal buffer fills).
// The server will close this channel when it disposes the client instance for any reason.
type ServerSendChan chan<- *proto.RGQLServerMessage

// NewServer tries to build a server given an existing schema.
func NewServer(sch *schema.Schema) (*Server, error) {
	if sch == nil {
		return nil, errors.New("Schema cannot be nil.")
	}
	if sch.Definitions == nil || sch.Document == nil || !sch.HasQueryResolvers() {
		return nil, errors.New("Schema does not have query resolvers defined, cannot process queries.")
	}
	return &Server{
		schema: sch,
	}, nil
}

// ParseSchema builds a new server given a schema string and a root query resolver.
func ParseSchema(schemaAst string, rootQueryResolver interface{}, rootMutationResolver interface{}) (*Server, error) {
	schm, err := schema.Parse(schemaAst)
	if err != nil {
		return nil, err
	}
	if err := schm.SetResolvers(rootQueryResolver, rootMutationResolver); err != nil {
		return nil, err
	}
	return NewServer(schm)
}

// FromSchema builds a new server given a pre-parsed graphql-go schemaDoc.
func FromSchema(schemaDoc *ast.Document, rootQueryResolver, rootMutationResolver interface{}) (*Server, error) {
	schm := schema.FromDocument(schemaDoc)
	if err := schm.SetResolvers(rootQueryResolver, rootMutationResolver); err != nil {
		return nil, err
	}
	return NewServer(schm)
}

// queryExecution represents a single executing query.
type queryExecution struct {
	ctx       context.Context
	ctxCancel context.CancelFunc

	ec         *execution.ExecutionContext
	qid        uint32
	outpChan   <-chan []byte
	cacheSize  uint32
	cacheStrat proto.RGQLValueInit_CacheStrategy
}

// QueryId returns the query ID for the execution.
func (e *queryExecution) QueryId() uint32 {
	return e.qid
}

// Output returns the query execution output channel.
func (e *queryExecution) Output() <-chan []byte {
	return e.outpChan
}

// CacheSize returns the cache size used.
func (e *queryExecution) CacheSize() uint32 {
	return e.cacheSize
}

// CacheStrategy returns the cache strategy used.
func (e *queryExecution) CacheStrategy() proto.RGQLValueInit_CacheStrategy {
	return e.cacheStrat
}

// ClientInstance is a handler for a single remote client's queries.
type ClientInstance struct {
	clientCtx       context.Context
	clientCtxCancel context.CancelFunc

	mtx         sync.Mutex
	sendChan    ServerSendChan
	multiplexer *result.ResultTreeMultiplexer
	queries     map[uint32]*queryExecution
	schema      *schema.Schema
	models      map[string]*execution.Model
	resolvers   map[string]interface{}
}

// BuildClient builds a new ClientInstance given a ServerSendChan write channel and root resolver instances.
func (s *Server) BuildClient(ctx context.Context, sendChan ServerSendChan, queryResolver interface{}, mutationResolver interface{}) (*ClientInstance, error) {
	if sendChan == nil {
		return nil, errors.New("The send channel cannot be nil.")
	}

	if err := s.schema.QueryModel.ValidateResolverInstance(queryResolver); err != nil {
		return nil, err
	}

	if s.schema.MutationModel == nil {
		mutationResolver = nil
	}

	if mutationResolver != nil {
		if err := s.schema.MutationModel.ValidateResolverInstance(mutationResolver); err != nil {
			return nil, err
		}
	}

	clientCtx, clientCtxCancel := context.WithCancel(ctx)
	return &ClientInstance{
		clientCtx:       clientCtx,
		clientCtxCancel: clientCtxCancel,
		sendChan:        sendChan,
		schema:          s.schema,
		multiplexer:     result.NewResultTreeMultiplexer(clientCtx, sendChan),
		queries:         make(map[uint32]*queryExecution),
		models: map[string]*execution.Model{
			"query":    s.schema.QueryModel,
			"mutation": s.schema.MutationModel,
		},
		resolvers: map[string]interface{}{
			"query":    queryResolver,
			"mutation": mutationResolver,
		},
	}, nil
}

func (ci *ClientInstance) send(msg *proto.RGQLServerMessage) {
	select {
	case <-ci.clientCtx.Done():
		return
	case ci.sendChan <- msg:
	}
}

func (ci *ClientInstance) handleInitQuery(msg *proto.RGQLQueryInit) (err error) {
	defer func() {
		if err != nil {
			ci.send(&proto.RGQLServerMessage{
				QueryError: &proto.RGQLQueryError{
					QueryId:     msg.QueryId,
					QueryNodeId: 0,
					Error:       err.Error(),
				},
			})
		}
	}()

	if _, ok := ci.queries[msg.QueryId]; ok {
		return errors.New("Duplicate query ID.")
	}

	nctx, nctxCancel := context.WithCancel(ci.clientCtx)
	errCh := make(chan *proto.RGQLQueryError, 10)
	outpCh := make(chan []byte, ResolverBufferSize)
	qt, err := ci.schema.BuildQueryTree(errCh, msg.OperationType)
	if err != nil {
		nctxCancel()
		return err
	}
	enc := encoding.NewResultEncoder(int(PathCacheSize))
	go enc.Run(nctx, outpCh)
	mod := ci.models[msg.OperationType]
	ec, err := mod.Execute(nctx, enc, qt, ci.resolvers[msg.OperationType], mod.IsSerialOnly() || msg.ForceSerial)
	e := &queryExecution{
		ctx:        nctx,
		ctxCancel:  nctxCancel,
		ec:         ec,
		cacheSize:  PathCacheSize,
		cacheStrat: proto.RGQLValueInit_CACHE_LRU,
		outpChan:   outpCh,
		qid:        msg.QueryId,
	}
	ci.queries[msg.QueryId] = e
	ci.multiplexer.AddExecution(e)
	return nil
}

func (ci *ClientInstance) handleFinishQuery(msg *proto.RGQLQueryFinish) {
	id := msg.QueryId
	q, ok := ci.queries[id]
	if !ok {
		return
	}
	q.ctxCancel()
	delete(ci.queries, id)
}

// HandleMessage instructs the server to handle a message from a remote client.
func (ci *ClientInstance) HandleMessage(msg *proto.RGQLClientMessage) {
	ci.mtx.Lock()
	defer ci.mtx.Unlock()

	if msg.InitQuery != nil {
		ci.handleInitQuery(msg.InitQuery)
	}

	if msg.MutateTree != nil {
		query, ok := ci.queries[msg.MutateTree.QueryId]
		if ok {
			query.ec.QNodeRoot.ApplyTreeMutation(msg.MutateTree)
		}
	}

	if msg.FinishQuery != nil {
		ci.handleFinishQuery(msg.FinishQuery)
	}
}

// Cancel cancels the context for this client.
func (ci *ClientInstance) Cancel() {
	ci.clientCtxCancel()
}
