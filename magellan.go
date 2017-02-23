package magellan

import (
	"context"
	"encoding/json"
	"errors"
	"sync"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/schema"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

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

// BuildClient builds a new ClientInstance given a ServerSendChan write channel.
func (s *Server) BuildClient(ctx context.Context, sendChan ServerSendChan) (*ClientInstance, error) {
	if sendChan == nil {
		return nil, errors.New("The send channel cannot be nil.")
	}

	errCh := make(chan *proto.RGQLQueryError, 10)

	qt, err := s.schema.BuildQueryTree(errCh, false)
	if err != nil {
		return nil, err
	}

	clientCtx, clientCtxCancel := context.WithCancel(ctx)
	exec := s.schema.StartQuery(clientCtx, qt, false)
	nclient := &ClientInstance{
		clientCtx:       clientCtx,
		clientCtxCancel: clientCtxCancel,
		ec:              exec,
		sendChan:        sendChan,
		queryTree:       qt,
		errChan:         errCh,
		schema:          s.schema,
	}

	go nclient.worker()

	return nclient, nil
}

// ClientInstance is a handler for a single remote client's queries.
type ClientInstance struct {
	clientCtx       context.Context
	clientCtxCancel context.CancelFunc

	mtx       sync.Mutex
	sendChan  ServerSendChan
	queryTree *qtree.QueryTreeNode
	ec        schema.QueryExecution
	errChan   chan *proto.RGQLQueryError
	schema    *schema.Schema
}

// HandleMessage instructs the server to handle a message from a remote client.
func (ci *ClientInstance) HandleMessage(msg *proto.RGQLClientMessage) {
	ci.mtx.Lock()
	defer ci.mtx.Unlock()

	if ci.queryTree == nil {
		return
	}

	if msg.MutateTree != nil {
		ci.queryTree.ApplyTreeMutation(msg.MutateTree)
	}

	if msg.SerialOperation != nil {
		ci.handleSerialOperation(msg.SerialOperation)
	}
}

func (ci *ClientInstance) handleSerialOperation(op *proto.RGQLSerialOperation) {
	queryErrCh := make(chan *proto.RGQLQueryError, 10)
	qt, err := ci.schema.BuildQueryTree(queryErrCh, true)
	if err != nil {
		return
	}
	for _, varb := range op.Variables {
		qt.VariableStore.Put(varb)
	}
	for _, child := range op.QueryRoot.Children {
		qt.AddChild(child)
	}
	qt.VariableStore.GarbageCollect()
	select {
	case qerr := <-queryErrCh:
		// qerr.
		ci.sendChan <- &proto.RGQLServerMessage{
			SerialResponse: &proto.RGQLSerialResponse{
				OperationId: op.OperationId,
				QueryError:  qerr,
			},
		}
		return
	default:
	}

	exec := ci.schema.StartMutation(ci.clientCtx, qt)
	go func() {
		result, err := exec.Wait()
		resp := &proto.RGQLSerialResponse{OperationId: op.OperationId}
		if err != nil {
			dat, _ := json.Marshal(err.Error())
			resp.ResolveError = &proto.RGQLSerialError{
				ErrorJson: string(dat),
			}
		} else {
			dat, err := json.Marshal(result)
			if err != nil {
				return
			}
			resp.ResponseJson = string(dat)
		}
		ci.sendChan <- &proto.RGQLServerMessage{SerialResponse: resp}
	}()
}

// Cancel cancels the context for this client.
func (ci *ClientInstance) Cancel() {
	ci.clientCtxCancel()
}

// Wait waits for all resolvers to exit.
func (ci *ClientInstance) Wait() {
	if ci.ec != nil {
		ci.ec.Wait()
	}
}

// QueryTree returns the query tree root node.
func (ci *ClientInstance) QueryTree() *qtree.QueryTreeNode {
	return ci.queryTree
}

func (ci *ClientInstance) worker() {
	done := ci.clientCtx.Done()
	outgoing := ci.ec.Messages()

	defer func() {
		ci.mtx.Lock()
		ci.queryTree.Dispose()
		ci.queryTree = nil
		ci.ec.Cancel()
		ci.ec = nil
		ci.mtx.Unlock()

		go func() {
			defer func() {
				recover()
			}()
			close(ci.sendChan)
			ci.sendChan = nil
		}()
	}()

	for {
		select {
		case <-done:
			return
		case err := <-ci.errChan:
			ci.sendChan <- &proto.RGQLServerMessage{
				QueryError: err,
			}
		case msg, ok := <-outgoing:
			if !ok {
				return
			}
			select {
			case <-done:
				return
			case ci.sendChan <- msg:
			}
		}
	}
}
