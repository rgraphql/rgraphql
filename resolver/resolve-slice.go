package resolver

// ResolveSlice resolves a slice of values.
func ResolveSlice(ctx *Context, sliceLen int, resolveFunc func(ictx *Context, i int)) {
	for i := range sliceLen {
		resolveFunc(ctx.ArrayChild(uint32(i)), i) //nolint:gosec
	}
}
