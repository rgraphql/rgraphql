package resolver

import (
	proto "github.com/rgraphql/rgraphql"
)

// Value is a primitive value emitted by a resolver.
type Value struct {
	Context *Context
	Value   *proto.RGQLPrimitive
	Error   error
}

// GetPrimValueFuncName maps the primitive type to a value builder.
// String -> BuildStringValue
// Int -> BuildIntValue
// Bool -> BuildBoolValue, etc...
// Returns "" if undefined.
func GetPrimValueFuncName(primKind proto.RGQLPrimitive_Kind) string {
	switch primKind {
	case proto.RGQLPrimitive_PRIMITIVE_KIND_INT:
		return "BuildIntValue"
	case proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL:
		return "BuildBoolValue"
	case proto.RGQLPrimitive_PRIMITIVE_KIND_STRING:
		return "BuildStringValue"
	case proto.RGQLPrimitive_PRIMITIVE_KIND_FLOAT:
		return "BuildFloatValue"
	case proto.RGQLPrimitive_PRIMITIVE_KIND_NULL:
		return "BuildNullValue"
	default:
		return ""
	}
}

// BuildErrorValue builds a resolver value with an error.
func BuildErrorValue(err error) *Value {
	return &Value{
		Error: err,
	}
}

// BuildStringValue returns a string primitive value.
func BuildStringValue(val string) *Value {
	return &Value{
		Value: &proto.RGQLPrimitive{
			Kind:        proto.RGQLPrimitive_PRIMITIVE_KIND_STRING,
			StringValue: val,
		},
	}
}

// BuildIntValue returns a int primitive value.
func BuildIntValue(val int32) *Value {
	return &Value{
		Value: &proto.RGQLPrimitive{
			Kind:     proto.RGQLPrimitive_PRIMITIVE_KIND_INT,
			IntValue: val,
		},
	}
}

// BuildFloatValue returns a float primitive value.
func BuildFloatValue(val float64) *Value {
	return &Value{
		Value: &proto.RGQLPrimitive{
			Kind:       proto.RGQLPrimitive_PRIMITIVE_KIND_FLOAT,
			FloatValue: val,
		},
	}
}

// BuildBoolValue returns a boolean primitive value.
func BuildBoolValue(val bool) *Value {
	return &Value{
		Value: &proto.RGQLPrimitive{
			Kind:      proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL,
			BoolValue: val,
		},
	}
}

// BuildNullValue returns the null primitive value.
func BuildNullValue() *Value {
	return &Value{
		Value: &proto.RGQLPrimitive{
			Kind: proto.RGQLPrimitive_PRIMITIVE_KIND_NULL,
		},
	}
}
