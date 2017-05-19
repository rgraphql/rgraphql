import {
  IRGQLPrimitive,
  Kind,
} from './proto';

// UnpackPrimitive unpacks a primitive to a JS object.
export function UnpackPrimitive(prim: IRGQLPrimitive): any {
  switch (prim.kind) {
    case Kind.PRIMITIVE_KIND_ARRAY:
      return [];
    case Kind.PRIMITIVE_KIND_BINARY:
      return prim.binaryValue;
    case Kind.PRIMITIVE_KIND_BOOL:
      return prim.boolValue;
    case Kind.PRIMITIVE_KIND_FLOAT:
      return prim.floatValue;
    case Kind.PRIMITIVE_KIND_INT:
      return prim.intValue;
    case Kind.PRIMITIVE_KIND_OBJECT:
      return JSON.parse(prim.stringValue);
    case Kind.PRIMITIVE_KIND_NULL:
      return null;
    default:
      return undefined;
  }
}
