package server_rpc

import (
	"context"

	"github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/resolver"
	"github.com/rgraphql/rgraphql/schema"
	rserver "github.com/rgraphql/rgraphql/server"
	"github.com/sirupsen/logrus"
)

type RgraphqlQueryStream interface {
	Send(*rgraphql.RGQLServerMessage) error
	Recv() (*rgraphql.RGQLClientMessage, error)
}

// maxMessageSize is the maximum message size
const maxMessageSize int = 2e6

// Session is a websocket session.
type Session struct {
	// ctx is the context
	ctx context.Context
	// le is the log entry
	le *logrus.Entry
	// strm is the message read/write interface
	strm RgraphqlQueryStream
	// scm is the schema
	scm *schema.Schema
	// rgraphqlSession is the rgraphql session
	rgraphqlSession *rserver.Session
	// sendCh is the outgoing channel
	sendCh <-chan *rgraphql.RGQLServerMessage
}

// NewSession constructs a new session.
func NewSession(
	ctx context.Context,
	le *logrus.Entry,
	scm *schema.Schema,
	strm RgraphqlQueryStream,
	rootResolver func(r *resolver.Context),
) *Session {
	// Read "hello" packet w/ deadline.
	sess := &Session{
		ctx:  ctx,
		le:   le,
		strm: strm,
		scm:  scm,
	}
	sendCh := make(chan *rgraphql.RGQLServerMessage, 10)
	sess.rgraphqlSession = rserver.NewSession(
		ctx,
		scm,
		sendCh,
		rootResolver,
	)
	sess.sendCh = sendCh
	return sess
}

// Execute is the main session routine.
func (s *Session) Execute() error {
	defer s.rgraphqlSession.Cancel()

	errCh := make(chan error, 1)
	go func() {
		for {
			msg, err := s.strm.Recv()
			if err != nil {
				errCh <- err
				return
			}
			if err := s.handleRPCMessage(msg); err != nil {
				s.le.WithError(err).Warn("error handling incoming message")
				errCh <- err
				return
			}
		}
	}()

	ctx := s.ctx
	for {
		select {
		case <-ctx.Done():
			return context.Canceled
		case err := <-errCh:
			return err
		case msg := <-s.sendCh:
			if err := s.strm.Send(msg); err != nil {
				return err
			}
		}
	}

}

// handleRPCMessage handles an incoming rpc message.
func (s *Session) handleRPCMessage(msg *rgraphql.RGQLClientMessage) error {
	return s.rgraphqlSession.HandleMessage(msg)
}
