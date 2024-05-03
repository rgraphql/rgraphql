package types

import (
	proto "github.com/rgraphql/rgraphql"
)

// IsPrimEquiv checks if the two primitives are equivalent.
func IsPrimEquiv(a, b *proto.RGQLPrimitive) bool {
	if a == b {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	ak := a.GetKind()
	if ak != b.GetKind() {
		return false
	}

	switch ak {
	case proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL:
		return a.GetBoolValue() == b.GetBoolValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_FLOAT:
		return a.GetFloatValue() == b.GetFloatValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_INT:
		return a.GetIntValue() == b.GetIntValue()
	case proto.RGQLPrimitive_PRIMITIVE_KIND_STRING:
		return a.GetStringValue() == b.GetStringValue()
	}

	// other primitive kinds are just markers.
	return true
}
