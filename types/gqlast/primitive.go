package gqlast

import (
	"go/types"
)

// GraphQLPrimitivesKinds maps the GraphQL primitives to ast kinds.
var GraphQLPrimitivesKinds = map[string]types.BasicKind{
	"Int":     types.Int32,
	"String":  types.String,
	"Float":   types.Float32,
	"Boolean": types.Bool,
	"Object":  types.Invalid,
	"ID":      types.String,
}

// GraphQLPrimitivesTypes maps the GraphQL primitives to ast types.
var GraphQLPrimitivesTypes = map[string]types.Object{
	"Int":     types.Universe.Lookup("int32"),
	"String":  types.Universe.Lookup("string"),
	"Float":   types.Universe.Lookup("float32"),
	"Boolean": types.Universe.Lookup("bool"),
	"ID":      types.Universe.Lookup("string"),
}

// GoBasicKindStrings maps go basic kind types to strings.
var GoBasicKindStrings = map[types.BasicKind]string{
	types.Invalid: "invalid",

	// predeclared types
	types.Bool:          "bool",
	types.Int:           "int",
	types.Int8:          "int8",
	types.Int16:         "int16",
	types.Int32:         "int32",
	types.Int64:         "int64",
	types.Uint:          "uint",
	types.Uint8:         "uint8",
	types.Uint16:        "uint16",
	types.Uint32:        "uint32",
	types.Uint64:        "uint64",
	types.Uintptr:       "uintptr",
	types.Float32:       "float32",
	types.Float64:       "float64",
	types.Complex64:     "complex64",
	types.Complex128:    "complex128",
	types.String:        "string",
	types.UnsafePointer: "unsafe pointer",

	// types for untyped values
	types.UntypedBool:    "untyped bool",
	types.UntypedInt:     "untyped int",
	types.UntypedRune:    "untyped rune",
	types.UntypedFloat:   "untyped float",
	types.UntypedComplex: "untyped complex",
	types.UntypedString:  "untyped string",
	types.UntypedNil:     "untyped nil",
}
