package server

import (
	"context"
	"errors"
	"sync"

	proto "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/encoder"
	"github.com/rgraphql/rgraphql/qtree"
	"github.com/rgraphql/rgraphql/resolver"
	"github.com/rgraphql/rgraphql/result"
	"github.com/rgraphql/rgraphql/schema"
)

// Session is a client session container.
type Session struct {
	errCh  chan<- *proto.RGQLQueryError
	qtNode *qtree.QueryTreeNode

	clientCtx       context.Context
	clientCtxCancel context.CancelFunc

	mtx         sync.Mutex
	sendChan    ServerSendChan
	multiplexer *result.ResultTreeMultiplexer
	queries     map[uint32]*queryExecution
	schema      *schema.Schema
	rootRes     RootResolver
}

// RootResolver is the root resolver call.
type RootResolver func(rctx *resolver.Context)

// NewSession builds a new session.
func NewSession(ctx context.Context, schema *schema.Schema, sendCh ServerSendChan, rootRes RootResolver) *Session {
	clientCtx, clientCtxCancel := context.WithCancel(ctx)
	errCh := make(chan *proto.RGQLQueryError)
	qtNode := qtree.NewQueryTree(
		schema.Definitions.RootQuery,
		schema.Definitions,
		errCh,
	)
	multiplexer := result.NewResultTreeMultiplexer(clientCtx, sendCh)
	return &Session{
		clientCtx:       clientCtx,
		clientCtxCancel: clientCtxCancel,
		sendChan:        sendCh,
		schema:          schema,
		multiplexer:     multiplexer,
		queries:         make(map[uint32]*queryExecution),
		rootRes:         rootRes,

		qtNode: qtNode,
		errCh:  errCh,
	}
}

func (s *Session) send(msg *proto.RGQLServerMessage) {
	select {
	case <-s.clientCtx.Done():
		return
	case s.sendChan <- msg:
	}
}

func (s *Session) handleInitQuery(msg *proto.RGQLQueryInit) (err error) {
	defer func() {
		if err != nil {
			s.send(&proto.RGQLServerMessage{
				QueryError: &proto.RGQLQueryError{
					QueryId:     msg.QueryId,
					QueryNodeId: 0,
					Error:       err.Error(),
				},
			})
			// delete(s.queries, msg.GetQueryId())
		}
	}()

	if _, ok := s.queries[msg.GetQueryId()]; ok {
		return errors.New("duplicate query id")
	}

	nctx, nctxCancel := context.WithCancel(s.clientCtx)
	errCh := make(chan *proto.RGQLQueryError, 10)
	outpCh := make(chan []byte, ResultBufferSize)
	qt, err := s.schema.BuildQueryTree(errCh)
	if err != nil {
		nctxCancel()
		return err
	}

	enc := encoder.NewResultEncoder(int(PathCacheSize))
	rctx := resolver.NewContext(nctx, qt, enc)
	e := &queryExecution{
		ctx:        nctx,
		ctxCancel:  nctxCancel,
		cacheSize:  PathCacheSize,
		cacheStrat: proto.RGQLValueInit_CACHE_LRU,
		outpChan:   outpCh,
		qid:        msg.QueryId,
		qt:         qt,
	}
	s.queries[msg.QueryId] = e

	go enc.Run(nctx, outpCh)
	go s.rootRes(rctx)
	go s.multiplexer.AddExecution(e)
	return nil
}

func (s *Session) handleFinishQuery(msg *proto.RGQLQueryFinish) {
	id := msg.QueryId
	q, ok := s.queries[id]
	if !ok {
		return
	}
	q.ctxCancel()
	delete(s.queries, id)
}

// HandleMessage instructs the server to handle a message from a remote client.
func (s *Session) HandleMessage(msg *proto.RGQLClientMessage) error {
	s.mtx.Lock()
	defer s.mtx.Unlock()

	if msg.InitQuery != nil {
		return s.handleInitQuery(msg.InitQuery)
	}

	if msg.MutateTree != nil {
		query, ok := s.queries[msg.MutateTree.QueryId]
		if ok {
			if err := query.qt.ApplyTreeMutation(msg.MutateTree); err != nil {
				return err
			}
		}
	}

	if msg.FinishQuery != nil {
		s.handleFinishQuery(msg.FinishQuery)
	}
	return nil
}

// Cancel cancels the context for this client.
func (s *Session) Cancel() {
	s.clientCtxCancel()
}
