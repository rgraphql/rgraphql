import * as rgraphql from '../rgraphql.pb'

// Kind is an alias to the primitive kind type
const Kind = rgraphql.RGQLPrimitive_Kind

// UnpackPrimitive unpacks a primitive to a JS object.
export function UnpackPrimitive(prim: rgraphql.RGQLPrimitive): any {
  switch (prim.kind) {
    case Kind.PRIMITIVE_KIND_ARRAY:
      return []
    case Kind.PRIMITIVE_KIND_BOOL:
      return prim.boolValue
    case Kind.PRIMITIVE_KIND_FLOAT:
      return prim.floatValue
    case Kind.PRIMITIVE_KIND_INT:
      return prim.intValue
    case Kind.PRIMITIVE_KIND_OBJECT:
      if (!prim.stringValue) {
        return null
      }
      return JSON.parse(prim.stringValue)
    case Kind.PRIMITIVE_KIND_STRING:
      return prim.stringValue
    case Kind.PRIMITIVE_KIND_NULL:
      return null
    default:
      return undefined
  }
}

// PackPrimitive converts a JS object to a IRGQLPrimitive.
// NOTE: there is no way to express binary in the GraphQL language right now.
export function PackPrimitive(prim: any): rgraphql.RGQLPrimitive {
  if (prim === undefined || prim === null) {
    return { kind: Kind.PRIMITIVE_KIND_NULL }
  }
  if (typeof prim === 'boolean') {
    return { kind: Kind.PRIMITIVE_KIND_BOOL, boolValue: prim }
  }
  if (typeof prim === 'string') {
    return { kind: Kind.PRIMITIVE_KIND_STRING, stringValue: prim }
  }
  if (typeof prim === 'number') {
    if (prim % 1 === 0) {
      return { kind: Kind.PRIMITIVE_KIND_INT, intValue: prim }
    }
    return { kind: Kind.PRIMITIVE_KIND_FLOAT, floatValue: prim }
  }
  if (typeof prim === 'object') {
    if (prim instanceof Array && prim.length === 0) {
      return { kind: Kind.PRIMITIVE_KIND_ARRAY }
    }
    return {
      kind: Kind.PRIMITIVE_KIND_OBJECT,
      stringValue: JSON.stringify(prim),
    }
  }
  throw new Error('Unable to pack value.')
}
