package resolver

// ResolveValueSlice iterates over the slice
// Each function call returns a resolver.Value at index
// This value is emitted at the array index i.
func ResolveValueSlice(
	ctx *Context,
	sliceLen int,
	indexResolver func(i int) *Value,
) {
	for i := 0; i < sliceLen; i++ {
		ictx := ctx.ArrayChild(i)
		ictx.WriteValue(indexResolver(i), i+1 == sliceLen)
	}
}
