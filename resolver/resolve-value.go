package resolver

// ResolveValue resolves a context with a value.
func ResolveValue(rctx *Context, isFinal bool, getValue func() *Value) {
	rctx.WriteValue(getValue(), isFinal)
}
