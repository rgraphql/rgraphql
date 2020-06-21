import {
  ValueNode,
  ObjectValueNode,
  ListValueNode,
  TypeNode,
  GraphQLSchema,
  typeFromAST,
  GraphQLType
} from 'graphql'
import { LookupASTType } from './type-lookup'

interface StringedValue {
  value: string
}

export function astValueToJs(node: ValueNode): any {
  let sv: StringedValue = node as any
  switch (node.kind) {
    case 'FloatValue':
    case 'IntValue':
      return +sv.value
    case 'EnumValue':
    case 'StringValue':
    case 'BooleanValue':
      return sv.value
    case 'NullValue':
      return null
    case 'ListValue':
      let lv: ListValueNode = node
      let resa: any[] = []
      for (let subv of lv.values) {
        resa.push(astValueToJs(subv))
      }
      return resa
    case 'ObjectValue':
      let ov: ObjectValueNode = node
      let reso: any = {}
      for (let field of ov.fields) {
        reso[field.name.value] = astValueToJs(field.value)
      }
      return reso
    default:
      break
  }

  return undefined
}

// What ast kinds are valid for this value?
export function validAstKinds(value?: any): { [kind: string]: boolean } {
  let isString = typeof value === 'string'
  return {
    EnumValue: isString && value === value.toUpperCase(),
    StringValue: isString,
    BooleanValue: typeof value === 'boolean',
    IntValue: typeof value === 'number' && value % 1 === 0,
    FloatValue: typeof value === 'number',
    ListValue: !!value && typeof value === 'object' && value.constructor === Array,
    ObjectValue: !!value && typeof value === 'object' && value.constructor !== Array,
    NullValue: typeof value === 'object' && !value
  }
}

// Check if a value matches an ast kind
export function isAstKind(kind: string, value?: any): boolean {
  let vac = validAstKinds(value)
  return vac[kind] || false
}

// unwrapASTType unwraps a GraphQL type node.
export function unwrapAstType(typ: TypeNode): TypeNode {
  switch (typ.kind) {
    case 'ListType':
      return unwrapAstType(typ.type)
    case 'NonNullType':
      return unwrapAstType(typ.type)
    default:
      return typ
  }
}

export function isPrimitiveKind(kind: string): boolean {
  switch (kind) {
    case 'String':
    case 'Int':
    case 'Float':
    case 'Boolean':
    case 'ID':
      return true
    default:
      return false
  }
}

export function isAstPrimitive(typ: TypeNode): boolean {
  if (!typ) {
    return false
  }

  if (typ.kind === 'NamedType') {
    if (typ.name && typ.name.value) {
      return isPrimitiveKind(typ.name.value)
    }
  }

  return false
}

// getLookupType builds a function to lookup named types.
export function getLookupType(schema: GraphQLSchema): LookupASTType {
  return (astType: TypeNode): GraphQLType | null => {
    if (astType.kind !== 'NamedType') {
      return null
    }

    return typeFromAST(schema, astType) || null
  }
}
