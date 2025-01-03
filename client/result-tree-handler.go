package client

import (
	proto "github.com/rgraphql/rgraphql"
)

// ResultTreeHandler handles a result value sequence.
type ResultTreeHandler interface {
	// HandleResultValue handles the next value in the sequence, optionally
	// returning a handler for the next value(s) in the sequence.
	HandleResultValue(val *proto.RGQLValue) ResultTreeHandler
}
