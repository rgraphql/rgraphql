package types

import (
	"errors"
	"strconv"

	"github.com/graphql-go/graphql/language/ast"
	proto "github.com/rgraphql/rgraphql"
)

// NewASTPrimitive converts an ast.Value to a primitive.
func NewASTPrimitive(val ast.Value) (*proto.RGQLPrimitive, error) {
	switch v := val.(type) {
	case *ast.StringValue:
		return NewStringPrimitive(v.Value), nil
	case *ast.IntValue:
		i, err := strconv.ParseInt(v.Value, 10, 32)
		if err != nil {
			return nil, err
		}

		return NewIntPrimitive(int32(i)), nil
	case *ast.FloatValue:
		i, err := strconv.ParseFloat(v.Value, 64)
		if err != nil {
			return nil, err
		}
		return NewFloatPrimitive(i), nil
	case *ast.BooleanValue:
		return NewBoolPrimitive(v.Value), nil
	case *ast.EnumValue:
		// TODO: enum values
		return nil, errors.New("enum value not supported")
	case *ast.Variable:
		return nil, errors.New("cannot lookup variable value")
	default:
		return nil, errors.New("unsupported ast value type")
	}
}

// UnpackPrimitive unpacks a protobuf primitive.
func UnpackPrimitive(prim *proto.RGQLPrimitive) interface{} {
	switch prim.GetKind() {
	case proto.RGQLPrimitive_PRIMITIVE_KIND_ARRAY:
		return "[]"
	case proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL:
		return prim.GetBoolValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_FLOAT:
		return prim.GetFloatValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_INT:
		return prim.GetIntValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_NULL:
		return nil
	case proto.RGQLPrimitive_PRIMITIVE_KIND_OBJECT:
		return "{}"
	case proto.RGQLPrimitive_PRIMITIVE_KIND_STRING:
		return prim.GetStringValue()
	default:
		return "[unknown]"
	}
}

// NewStringPrimitive returns a string primitive.
func NewStringPrimitive(val string) *proto.RGQLPrimitive {
	return &proto.RGQLPrimitive{
		Kind:        proto.RGQLPrimitive_PRIMITIVE_KIND_STRING,
		StringValue: val,
	}
}

// NewIntPrimitive returns a int primitive.
func NewIntPrimitive(val int32) *proto.RGQLPrimitive {
	return &proto.RGQLPrimitive{
		Kind:     proto.RGQLPrimitive_PRIMITIVE_KIND_INT,
		IntValue: val,
	}
}

// NewFloatPrimitive returns a float primitive.
func NewFloatPrimitive(val float64) *proto.RGQLPrimitive {
	return &proto.RGQLPrimitive{
		Kind:       proto.RGQLPrimitive_PRIMITIVE_KIND_FLOAT,
		FloatValue: val,
	}
}

// NewBoolPrimitive returns a boolean primitive.
func NewBoolPrimitive(val bool) *proto.RGQLPrimitive {
	return &proto.RGQLPrimitive{
		Kind:      proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL,
		BoolValue: val,
	}
}

// NewNullPrimitive returns the null primitive.
func NewNullPrimitive() *proto.RGQLPrimitive {
	return &proto.RGQLPrimitive{
		Kind: proto.RGQLPrimitive_PRIMITIVE_KIND_NULL,
	}
}
