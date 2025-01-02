package resolver

import "errors"

// ErrValueOverflow is returned if a value overflows its type.
// This is used if an int overflows when converting to int32.
var ErrValueOverflow = errors.New("value overflow")

// ResolveValue resolves a context with a value.
func ResolveValue(rctx *Context, isFinal bool, getValue func() *Value) {
	rctx.WriteValue(getValue(), isFinal)
}
