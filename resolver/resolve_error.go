package resolver

import (
	"context"
)

// ResolveError applies an error to a resolver context.
// If err == nil|context.Canceled, calls SetFinal to mark the node as done.
// Otherwise, marks the resolver context with the error.
func ResolveError(rctx *Context, err error) {
	if err == nil || err == context.Canceled {
		rctx.MarkFinal()
		return
	}

	rctx.SetError(err)
}
