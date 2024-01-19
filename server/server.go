package server

import (
	"context"

	proto "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/schema"
)

// PathCacheSize determines how large the shared client-server path cache should be.
var PathCacheSize uint32 = 100

// ResultBufferSize determines how large the buffer for outgoing results should be.
var ResultBufferSize uint32 = 50

// ServerSendChan is a channel used to send updates to a remote client.
// This should be sufficiently buffered, as internally resolver processing will
// halt until new messages are writable to the channel (after an internal buffer fills).
// The server will close this channel when it disposes the client instance for any reason.
type ServerSendChan chan<- *proto.RGQLServerMessage

// Server serves sessions with clients.
// Clients keep a query tree in sync with the server.
type Server struct {
	// schema is the graphql schema
	schema *schema.Schema
}

// NewServer builds a new server.
func NewServer(schema *schema.Schema) *Server {
	return &Server{schema: schema}
}

// BuildSession builds a new session.
func (s *Server) BuildSession(ctx context.Context, sendCh ServerSendChan, rootRes RootResolver) *Session {
	return NewSession(ctx, s, sendCh, rootRes)
}
