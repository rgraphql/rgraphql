package server

import (
	"context"
	"encoding/json"
	"errors"
	"sync"

	"github.com/sirupsen/logrus"

	"github.com/rgraphql/magellan/encoder"
	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/resolver"
	"github.com/rgraphql/magellan/result"
	"github.com/rgraphql/magellan/schema"
	proto "github.com/rgraphql/rgraphql"
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
func NewSession(ctx context.Context, server *Server, sendCh ServerSendChan, rootRes RootResolver) *Session {
	clientCtx, clientCtxCancel := context.WithCancel(ctx)
	errCh := make(chan *proto.RGQLQueryError)
	qtNode := qtree.NewQueryTree(
		server.schema.Definitions.RootQuery,
		server.schema.Definitions,
		errCh,
	)
	multiplexer := result.NewResultTreeMultiplexer(clientCtx, sendCh)
	return &Session{
		clientCtx:       clientCtx,
		clientCtxCancel: clientCtxCancel,
		sendChan:        sendCh,
		schema:          server.schema,
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
	logrus.Infof(" - query initialized: %d", msg.QueryId)

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
func (s *Session) HandleMessage(msg *proto.RGQLClientMessage) {
	dat, _ := json.Marshal(msg)
	logrus.Infof("handling message %s", string(dat))
	s.mtx.Lock()
	defer s.mtx.Unlock()

	if msg.InitQuery != nil {
		s.handleInitQuery(msg.InitQuery)
	}

	if msg.MutateTree != nil {
		query, ok := s.queries[msg.MutateTree.QueryId]
		logrus.Infof(" - matching query id %d mutate tree: %v", msg.MutateTree.GetQueryId(), ok)
		if ok {
			query.qt.ApplyTreeMutation(msg.MutateTree)
		}
	}

	if msg.FinishQuery != nil {
		s.handleFinishQuery(msg.FinishQuery)
	}
}

// Cancel cancels the context for this client.
func (s *Session) Cancel() {
	s.clientCtxCancel()
}
