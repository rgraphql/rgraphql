/* eslint-disable */
import Long from 'long'
import _m0 from 'protobufjs/minimal.js'

export const protobufPackage = 'rgraphql'

export interface RGQLQueryFieldDirective {
  /** Directive name */
  name: string
  /** Optional arguments. */
  args: FieldArgument[]
}

export interface RGQLQueryTreeNode {
  /** Integer ID of the node. */
  id: number
  /** Name of the field this node represents. */
  fieldName: string
  /** Arguments. */
  args: FieldArgument[]
  /** Directives */
  directive: RGQLQueryFieldDirective[]
  /** Children */
  children: RGQLQueryTreeNode[]
}

export interface FieldArgument {
  name: string
  variableId: number
}

export interface ASTVariable {
  id: number
  value: RGQLPrimitive | undefined
}

export interface RGQLPrimitive {
  kind: RGQLPrimitive_Kind
  intValue: number
  floatValue: number
  stringValue: string
  boolValue: boolean
}

export enum RGQLPrimitive_Kind {
  PRIMITIVE_KIND_NULL = 0,
  PRIMITIVE_KIND_INT = 1,
  PRIMITIVE_KIND_FLOAT = 2,
  PRIMITIVE_KIND_STRING = 3,
  PRIMITIVE_KIND_BOOL = 4,
  PRIMITIVE_KIND_OBJECT = 5,
  /** PRIMITIVE_KIND_ARRAY - A marker for an empty array. */
  PRIMITIVE_KIND_ARRAY = 6,
  UNRECOGNIZED = -1,
}

export function rGQLPrimitive_KindFromJSON(object: any): RGQLPrimitive_Kind {
  switch (object) {
    case 0:
    case 'PRIMITIVE_KIND_NULL':
      return RGQLPrimitive_Kind.PRIMITIVE_KIND_NULL
    case 1:
    case 'PRIMITIVE_KIND_INT':
      return RGQLPrimitive_Kind.PRIMITIVE_KIND_INT
    case 2:
    case 'PRIMITIVE_KIND_FLOAT':
      return RGQLPrimitive_Kind.PRIMITIVE_KIND_FLOAT
    case 3:
    case 'PRIMITIVE_KIND_STRING':
      return RGQLPrimitive_Kind.PRIMITIVE_KIND_STRING
    case 4:
    case 'PRIMITIVE_KIND_BOOL':
      return RGQLPrimitive_Kind.PRIMITIVE_KIND_BOOL
    case 5:
    case 'PRIMITIVE_KIND_OBJECT':
      return RGQLPrimitive_Kind.PRIMITIVE_KIND_OBJECT
    case 6:
    case 'PRIMITIVE_KIND_ARRAY':
      return RGQLPrimitive_Kind.PRIMITIVE_KIND_ARRAY
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RGQLPrimitive_Kind.UNRECOGNIZED
  }
}

export function rGQLPrimitive_KindToJSON(object: RGQLPrimitive_Kind): string {
  switch (object) {
    case RGQLPrimitive_Kind.PRIMITIVE_KIND_NULL:
      return 'PRIMITIVE_KIND_NULL'
    case RGQLPrimitive_Kind.PRIMITIVE_KIND_INT:
      return 'PRIMITIVE_KIND_INT'
    case RGQLPrimitive_Kind.PRIMITIVE_KIND_FLOAT:
      return 'PRIMITIVE_KIND_FLOAT'
    case RGQLPrimitive_Kind.PRIMITIVE_KIND_STRING:
      return 'PRIMITIVE_KIND_STRING'
    case RGQLPrimitive_Kind.PRIMITIVE_KIND_BOOL:
      return 'PRIMITIVE_KIND_BOOL'
    case RGQLPrimitive_Kind.PRIMITIVE_KIND_OBJECT:
      return 'PRIMITIVE_KIND_OBJECT'
    case RGQLPrimitive_Kind.PRIMITIVE_KIND_ARRAY:
      return 'PRIMITIVE_KIND_ARRAY'
    case RGQLPrimitive_Kind.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

/** Messages */
export interface RGQLClientMessage {
  initQuery: RGQLQueryInit | undefined
  mutateTree: RGQLQueryTreeMutation | undefined
  finishQuery: RGQLQueryFinish | undefined
}

export interface RGQLQueryInit {
  /** The ID of this query. */
  queryId: number
  /**
   * Force serial for this query?
   * Note: serial queries execute as soon as the first mutation arrives, and cannot be updated.
   */
  forceSerial: boolean
  /** Operation type, i.e. query, mutation, etc. */
  operationType: string
}

export interface RGQLQueryTreeMutation {
  /** The ID of this query. */
  queryId: number
  /** All node mutations in this step. */
  nodeMutation: RGQLQueryTreeMutation_NodeMutation[]
  /** Any new variables. */
  variables: ASTVariable[]
}

export enum RGQLQueryTreeMutation_SubtreeOperation {
  /** SUBTREE_ADD_CHILD - Add a child tree to the subtree. */
  SUBTREE_ADD_CHILD = 0,
  /** SUBTREE_DELETE - Delete a tree node and all children. */
  SUBTREE_DELETE = 1,
  UNRECOGNIZED = -1,
}

export function rGQLQueryTreeMutation_SubtreeOperationFromJSON(
  object: any,
): RGQLQueryTreeMutation_SubtreeOperation {
  switch (object) {
    case 0:
    case 'SUBTREE_ADD_CHILD':
      return RGQLQueryTreeMutation_SubtreeOperation.SUBTREE_ADD_CHILD
    case 1:
    case 'SUBTREE_DELETE':
      return RGQLQueryTreeMutation_SubtreeOperation.SUBTREE_DELETE
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RGQLQueryTreeMutation_SubtreeOperation.UNRECOGNIZED
  }
}

export function rGQLQueryTreeMutation_SubtreeOperationToJSON(
  object: RGQLQueryTreeMutation_SubtreeOperation,
): string {
  switch (object) {
    case RGQLQueryTreeMutation_SubtreeOperation.SUBTREE_ADD_CHILD:
      return 'SUBTREE_ADD_CHILD'
    case RGQLQueryTreeMutation_SubtreeOperation.SUBTREE_DELETE:
      return 'SUBTREE_DELETE'
    case RGQLQueryTreeMutation_SubtreeOperation.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export interface RGQLQueryTreeMutation_NodeMutation {
  /** ID of the node we are operating on. */
  nodeId: number
  /** Operation we are taking. */
  operation: RGQLQueryTreeMutation_SubtreeOperation
  /** The new node tree to add, if we are adding a child. */
  node: RGQLQueryTreeNode | undefined
}

export interface RGQLQueryFinish {
  /** The ID of this query. */
  queryId: number
}

export interface RGQLServerMessage {
  queryError: RGQLQueryError | undefined
  valueInit: RGQLValueInit | undefined
  valueBatch: RGQLValueBatch | undefined
  valueFinalize: RGQLValueFinalize | undefined
}

/** RGQLValueInit initializes a result value tree. */
export interface RGQLValueInit {
  /** result_id is the identifier for the result tree. */
  resultId: number
  /** query_id is the identifier for the corresponding query. */
  queryId: number
  /** cache_strategy is the strategy used for the path cache. */
  cacheStrategy: RGQLValueInit_CacheStrategy
  /** cache_size is the size of the path cache, if necessary. */
  cacheSize: number
}

export enum RGQLValueInit_CacheStrategy {
  CACHE_LRU = 0,
  UNRECOGNIZED = -1,
}

export function rGQLValueInit_CacheStrategyFromJSON(
  object: any,
): RGQLValueInit_CacheStrategy {
  switch (object) {
    case 0:
    case 'CACHE_LRU':
      return RGQLValueInit_CacheStrategy.CACHE_LRU
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RGQLValueInit_CacheStrategy.UNRECOGNIZED
  }
}

export function rGQLValueInit_CacheStrategyToJSON(
  object: RGQLValueInit_CacheStrategy,
): string {
  switch (object) {
    case RGQLValueInit_CacheStrategy.CACHE_LRU:
      return 'CACHE_LRU'
    case RGQLValueInit_CacheStrategy.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

/** RGQLValueFinalize finalizes a result tree. */
export interface RGQLValueFinalize {
  resultId: number
}

/** Communicating a failure in the input query. */
export interface RGQLQueryError {
  queryId: number
  queryNodeId: number
  error: string
}

export interface RGQLValue {
  /** The ID of the field in the query tree, if a field. */
  queryNodeId: number
  /** The 1-based index, if an array element. */
  arrayIndex: number
  /**
   * If this is a 0-th index value, this is a pointer to a previous identifier.
   * Otherwise, this is an identifier for adding an alias to this path.
   */
  posIdentifier: number
  /** The value, if we have one. */
  value: RGQLPrimitive | undefined
  /** The error, if we are erroring this field. */
  error: string
}

export interface RGQLValueBatch {
  /** The ID of the result tree this batch is for. */
  resultId: number
  /** The batch of RGQLValue values, encoded. */
  values: Uint8Array[]
}

function createBaseRGQLQueryFieldDirective(): RGQLQueryFieldDirective {
  return { name: '', args: [] }
}

export const RGQLQueryFieldDirective = {
  encode(
    message: RGQLQueryFieldDirective,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name)
    }
    for (const v of message.args) {
      FieldArgument.encode(v!, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RGQLQueryFieldDirective {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryFieldDirective()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.name = reader.string()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.args.push(FieldArgument.decode(reader, reader.uint32()))
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryFieldDirective, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryFieldDirective | RGQLQueryFieldDirective[]>
      | Iterable<RGQLQueryFieldDirective | RGQLQueryFieldDirective[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryFieldDirective.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryFieldDirective.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryFieldDirective>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLQueryFieldDirective> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryFieldDirective.decode(p)]
        }
      } else {
        yield* [RGQLQueryFieldDirective.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryFieldDirective {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : '',
      args: globalThis.Array.isArray(object?.args)
        ? object.args.map((e: any) => FieldArgument.fromJSON(e))
        : [],
    }
  },

  toJSON(message: RGQLQueryFieldDirective): unknown {
    const obj: any = {}
    if (message.name !== '') {
      obj.name = message.name
    }
    if (message.args?.length) {
      obj.args = message.args.map((e) => FieldArgument.toJSON(e))
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLQueryFieldDirective>, I>>(
    base?: I,
  ): RGQLQueryFieldDirective {
    return RGQLQueryFieldDirective.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLQueryFieldDirective>, I>>(
    object: I,
  ): RGQLQueryFieldDirective {
    const message = createBaseRGQLQueryFieldDirective()
    message.name = object.name ?? ''
    message.args = object.args?.map((e) => FieldArgument.fromPartial(e)) || []
    return message
  },
}

function createBaseRGQLQueryTreeNode(): RGQLQueryTreeNode {
  return { id: 0, fieldName: '', args: [], directive: [], children: [] }
}

export const RGQLQueryTreeNode = {
  encode(
    message: RGQLQueryTreeNode,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint32(message.id)
    }
    if (message.fieldName !== '') {
      writer.uint32(18).string(message.fieldName)
    }
    for (const v of message.args) {
      FieldArgument.encode(v!, writer.uint32(26).fork()).ldelim()
    }
    for (const v of message.directive) {
      RGQLQueryFieldDirective.encode(v!, writer.uint32(34).fork()).ldelim()
    }
    for (const v of message.children) {
      RGQLQueryTreeNode.encode(v!, writer.uint32(42).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLQueryTreeNode {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryTreeNode()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.id = reader.uint32()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.fieldName = reader.string()
          continue
        case 3:
          if (tag !== 26) {
            break
          }

          message.args.push(FieldArgument.decode(reader, reader.uint32()))
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.directive.push(
            RGQLQueryFieldDirective.decode(reader, reader.uint32()),
          )
          continue
        case 5:
          if (tag !== 42) {
            break
          }

          message.children.push(
            RGQLQueryTreeNode.decode(reader, reader.uint32()),
          )
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryTreeNode, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryTreeNode | RGQLQueryTreeNode[]>
      | Iterable<RGQLQueryTreeNode | RGQLQueryTreeNode[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryTreeNode.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryTreeNode.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryTreeNode>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLQueryTreeNode> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryTreeNode.decode(p)]
        }
      } else {
        yield* [RGQLQueryTreeNode.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryTreeNode {
    return {
      id: isSet(object.id) ? globalThis.Number(object.id) : 0,
      fieldName: isSet(object.fieldName)
        ? globalThis.String(object.fieldName)
        : '',
      args: globalThis.Array.isArray(object?.args)
        ? object.args.map((e: any) => FieldArgument.fromJSON(e))
        : [],
      directive: globalThis.Array.isArray(object?.directive)
        ? object.directive.map((e: any) => RGQLQueryFieldDirective.fromJSON(e))
        : [],
      children: globalThis.Array.isArray(object?.children)
        ? object.children.map((e: any) => RGQLQueryTreeNode.fromJSON(e))
        : [],
    }
  },

  toJSON(message: RGQLQueryTreeNode): unknown {
    const obj: any = {}
    if (message.id !== 0) {
      obj.id = Math.round(message.id)
    }
    if (message.fieldName !== '') {
      obj.fieldName = message.fieldName
    }
    if (message.args?.length) {
      obj.args = message.args.map((e) => FieldArgument.toJSON(e))
    }
    if (message.directive?.length) {
      obj.directive = message.directive.map((e) =>
        RGQLQueryFieldDirective.toJSON(e),
      )
    }
    if (message.children?.length) {
      obj.children = message.children.map((e) => RGQLQueryTreeNode.toJSON(e))
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLQueryTreeNode>, I>>(
    base?: I,
  ): RGQLQueryTreeNode {
    return RGQLQueryTreeNode.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLQueryTreeNode>, I>>(
    object: I,
  ): RGQLQueryTreeNode {
    const message = createBaseRGQLQueryTreeNode()
    message.id = object.id ?? 0
    message.fieldName = object.fieldName ?? ''
    message.args = object.args?.map((e) => FieldArgument.fromPartial(e)) || []
    message.directive =
      object.directive?.map((e) => RGQLQueryFieldDirective.fromPartial(e)) || []
    message.children =
      object.children?.map((e) => RGQLQueryTreeNode.fromPartial(e)) || []
    return message
  },
}

function createBaseFieldArgument(): FieldArgument {
  return { name: '', variableId: 0 }
}

export const FieldArgument = {
  encode(
    message: FieldArgument,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name)
    }
    if (message.variableId !== 0) {
      writer.uint32(16).uint32(message.variableId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FieldArgument {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseFieldArgument()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.name = reader.string()
          continue
        case 2:
          if (tag !== 16) {
            break
          }

          message.variableId = reader.uint32()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<FieldArgument, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<FieldArgument | FieldArgument[]>
      | Iterable<FieldArgument | FieldArgument[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [FieldArgument.encode(p).finish()]
        }
      } else {
        yield* [FieldArgument.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, FieldArgument>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<FieldArgument> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [FieldArgument.decode(p)]
        }
      } else {
        yield* [FieldArgument.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): FieldArgument {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : '',
      variableId: isSet(object.variableId)
        ? globalThis.Number(object.variableId)
        : 0,
    }
  },

  toJSON(message: FieldArgument): unknown {
    const obj: any = {}
    if (message.name !== '') {
      obj.name = message.name
    }
    if (message.variableId !== 0) {
      obj.variableId = Math.round(message.variableId)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<FieldArgument>, I>>(
    base?: I,
  ): FieldArgument {
    return FieldArgument.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<FieldArgument>, I>>(
    object: I,
  ): FieldArgument {
    const message = createBaseFieldArgument()
    message.name = object.name ?? ''
    message.variableId = object.variableId ?? 0
    return message
  },
}

function createBaseASTVariable(): ASTVariable {
  return { id: 0, value: undefined }
}

export const ASTVariable = {
  encode(
    message: ASTVariable,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint32(message.id)
    }
    if (message.value !== undefined) {
      RGQLPrimitive.encode(message.value, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ASTVariable {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseASTVariable()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.id = reader.uint32()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.value = RGQLPrimitive.decode(reader, reader.uint32())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<ASTVariable, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<ASTVariable | ASTVariable[]>
      | Iterable<ASTVariable | ASTVariable[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [ASTVariable.encode(p).finish()]
        }
      } else {
        yield* [ASTVariable.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, ASTVariable>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<ASTVariable> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [ASTVariable.decode(p)]
        }
      } else {
        yield* [ASTVariable.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): ASTVariable {
    return {
      id: isSet(object.id) ? globalThis.Number(object.id) : 0,
      value: isSet(object.value)
        ? RGQLPrimitive.fromJSON(object.value)
        : undefined,
    }
  },

  toJSON(message: ASTVariable): unknown {
    const obj: any = {}
    if (message.id !== 0) {
      obj.id = Math.round(message.id)
    }
    if (message.value !== undefined) {
      obj.value = RGQLPrimitive.toJSON(message.value)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<ASTVariable>, I>>(base?: I): ASTVariable {
    return ASTVariable.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<ASTVariable>, I>>(
    object: I,
  ): ASTVariable {
    const message = createBaseASTVariable()
    message.id = object.id ?? 0
    message.value =
      object.value !== undefined && object.value !== null
        ? RGQLPrimitive.fromPartial(object.value)
        : undefined
    return message
  },
}

function createBaseRGQLPrimitive(): RGQLPrimitive {
  return {
    kind: 0,
    intValue: 0,
    floatValue: 0,
    stringValue: '',
    boolValue: false,
  }
}

export const RGQLPrimitive = {
  encode(
    message: RGQLPrimitive,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.kind !== 0) {
      writer.uint32(8).int32(message.kind)
    }
    if (message.intValue !== 0) {
      writer.uint32(16).int32(message.intValue)
    }
    if (message.floatValue !== 0) {
      writer.uint32(25).double(message.floatValue)
    }
    if (message.stringValue !== '') {
      writer.uint32(34).string(message.stringValue)
    }
    if (message.boolValue === true) {
      writer.uint32(40).bool(message.boolValue)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLPrimitive {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLPrimitive()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.kind = reader.int32() as any
          continue
        case 2:
          if (tag !== 16) {
            break
          }

          message.intValue = reader.int32()
          continue
        case 3:
          if (tag !== 25) {
            break
          }

          message.floatValue = reader.double()
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.stringValue = reader.string()
          continue
        case 5:
          if (tag !== 40) {
            break
          }

          message.boolValue = reader.bool()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLPrimitive, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLPrimitive | RGQLPrimitive[]>
      | Iterable<RGQLPrimitive | RGQLPrimitive[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLPrimitive.encode(p).finish()]
        }
      } else {
        yield* [RGQLPrimitive.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLPrimitive>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLPrimitive> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLPrimitive.decode(p)]
        }
      } else {
        yield* [RGQLPrimitive.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLPrimitive {
    return {
      kind: isSet(object.kind) ? rGQLPrimitive_KindFromJSON(object.kind) : 0,
      intValue: isSet(object.intValue) ? globalThis.Number(object.intValue) : 0,
      floatValue: isSet(object.floatValue)
        ? globalThis.Number(object.floatValue)
        : 0,
      stringValue: isSet(object.stringValue)
        ? globalThis.String(object.stringValue)
        : '',
      boolValue: isSet(object.boolValue)
        ? globalThis.Boolean(object.boolValue)
        : false,
    }
  },

  toJSON(message: RGQLPrimitive): unknown {
    const obj: any = {}
    if (message.kind !== 0) {
      obj.kind = rGQLPrimitive_KindToJSON(message.kind)
    }
    if (message.intValue !== 0) {
      obj.intValue = Math.round(message.intValue)
    }
    if (message.floatValue !== 0) {
      obj.floatValue = message.floatValue
    }
    if (message.stringValue !== '') {
      obj.stringValue = message.stringValue
    }
    if (message.boolValue === true) {
      obj.boolValue = message.boolValue
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLPrimitive>, I>>(
    base?: I,
  ): RGQLPrimitive {
    return RGQLPrimitive.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLPrimitive>, I>>(
    object: I,
  ): RGQLPrimitive {
    const message = createBaseRGQLPrimitive()
    message.kind = object.kind ?? 0
    message.intValue = object.intValue ?? 0
    message.floatValue = object.floatValue ?? 0
    message.stringValue = object.stringValue ?? ''
    message.boolValue = object.boolValue ?? false
    return message
  },
}

function createBaseRGQLClientMessage(): RGQLClientMessage {
  return { initQuery: undefined, mutateTree: undefined, finishQuery: undefined }
}

export const RGQLClientMessage = {
  encode(
    message: RGQLClientMessage,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.initQuery !== undefined) {
      RGQLQueryInit.encode(message.initQuery, writer.uint32(10).fork()).ldelim()
    }
    if (message.mutateTree !== undefined) {
      RGQLQueryTreeMutation.encode(
        message.mutateTree,
        writer.uint32(18).fork(),
      ).ldelim()
    }
    if (message.finishQuery !== undefined) {
      RGQLQueryFinish.encode(
        message.finishQuery,
        writer.uint32(26).fork(),
      ).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLClientMessage {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLClientMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.initQuery = RGQLQueryInit.decode(reader, reader.uint32())
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.mutateTree = RGQLQueryTreeMutation.decode(
            reader,
            reader.uint32(),
          )
          continue
        case 3:
          if (tag !== 26) {
            break
          }

          message.finishQuery = RGQLQueryFinish.decode(reader, reader.uint32())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLClientMessage, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLClientMessage | RGQLClientMessage[]>
      | Iterable<RGQLClientMessage | RGQLClientMessage[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLClientMessage.encode(p).finish()]
        }
      } else {
        yield* [RGQLClientMessage.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLClientMessage>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLClientMessage> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLClientMessage.decode(p)]
        }
      } else {
        yield* [RGQLClientMessage.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLClientMessage {
    return {
      initQuery: isSet(object.initQuery)
        ? RGQLQueryInit.fromJSON(object.initQuery)
        : undefined,
      mutateTree: isSet(object.mutateTree)
        ? RGQLQueryTreeMutation.fromJSON(object.mutateTree)
        : undefined,
      finishQuery: isSet(object.finishQuery)
        ? RGQLQueryFinish.fromJSON(object.finishQuery)
        : undefined,
    }
  },

  toJSON(message: RGQLClientMessage): unknown {
    const obj: any = {}
    if (message.initQuery !== undefined) {
      obj.initQuery = RGQLQueryInit.toJSON(message.initQuery)
    }
    if (message.mutateTree !== undefined) {
      obj.mutateTree = RGQLQueryTreeMutation.toJSON(message.mutateTree)
    }
    if (message.finishQuery !== undefined) {
      obj.finishQuery = RGQLQueryFinish.toJSON(message.finishQuery)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLClientMessage>, I>>(
    base?: I,
  ): RGQLClientMessage {
    return RGQLClientMessage.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLClientMessage>, I>>(
    object: I,
  ): RGQLClientMessage {
    const message = createBaseRGQLClientMessage()
    message.initQuery =
      object.initQuery !== undefined && object.initQuery !== null
        ? RGQLQueryInit.fromPartial(object.initQuery)
        : undefined
    message.mutateTree =
      object.mutateTree !== undefined && object.mutateTree !== null
        ? RGQLQueryTreeMutation.fromPartial(object.mutateTree)
        : undefined
    message.finishQuery =
      object.finishQuery !== undefined && object.finishQuery !== null
        ? RGQLQueryFinish.fromPartial(object.finishQuery)
        : undefined
    return message
  },
}

function createBaseRGQLQueryInit(): RGQLQueryInit {
  return { queryId: 0, forceSerial: false, operationType: '' }
}

export const RGQLQueryInit = {
  encode(
    message: RGQLQueryInit,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.queryId !== 0) {
      writer.uint32(8).uint32(message.queryId)
    }
    if (message.forceSerial === true) {
      writer.uint32(16).bool(message.forceSerial)
    }
    if (message.operationType !== '') {
      writer.uint32(26).string(message.operationType)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLQueryInit {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryInit()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.queryId = reader.uint32()
          continue
        case 2:
          if (tag !== 16) {
            break
          }

          message.forceSerial = reader.bool()
          continue
        case 3:
          if (tag !== 26) {
            break
          }

          message.operationType = reader.string()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryInit, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryInit | RGQLQueryInit[]>
      | Iterable<RGQLQueryInit | RGQLQueryInit[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryInit.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryInit.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryInit>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLQueryInit> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryInit.decode(p)]
        }
      } else {
        yield* [RGQLQueryInit.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryInit {
    return {
      queryId: isSet(object.queryId) ? globalThis.Number(object.queryId) : 0,
      forceSerial: isSet(object.forceSerial)
        ? globalThis.Boolean(object.forceSerial)
        : false,
      operationType: isSet(object.operationType)
        ? globalThis.String(object.operationType)
        : '',
    }
  },

  toJSON(message: RGQLQueryInit): unknown {
    const obj: any = {}
    if (message.queryId !== 0) {
      obj.queryId = Math.round(message.queryId)
    }
    if (message.forceSerial === true) {
      obj.forceSerial = message.forceSerial
    }
    if (message.operationType !== '') {
      obj.operationType = message.operationType
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLQueryInit>, I>>(
    base?: I,
  ): RGQLQueryInit {
    return RGQLQueryInit.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLQueryInit>, I>>(
    object: I,
  ): RGQLQueryInit {
    const message = createBaseRGQLQueryInit()
    message.queryId = object.queryId ?? 0
    message.forceSerial = object.forceSerial ?? false
    message.operationType = object.operationType ?? ''
    return message
  },
}

function createBaseRGQLQueryTreeMutation(): RGQLQueryTreeMutation {
  return { queryId: 0, nodeMutation: [], variables: [] }
}

export const RGQLQueryTreeMutation = {
  encode(
    message: RGQLQueryTreeMutation,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.queryId !== 0) {
      writer.uint32(8).uint32(message.queryId)
    }
    for (const v of message.nodeMutation) {
      RGQLQueryTreeMutation_NodeMutation.encode(
        v!,
        writer.uint32(18).fork(),
      ).ldelim()
    }
    for (const v of message.variables) {
      ASTVariable.encode(v!, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RGQLQueryTreeMutation {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryTreeMutation()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.queryId = reader.uint32()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.nodeMutation.push(
            RGQLQueryTreeMutation_NodeMutation.decode(reader, reader.uint32()),
          )
          continue
        case 3:
          if (tag !== 26) {
            break
          }

          message.variables.push(ASTVariable.decode(reader, reader.uint32()))
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryTreeMutation, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryTreeMutation | RGQLQueryTreeMutation[]>
      | Iterable<RGQLQueryTreeMutation | RGQLQueryTreeMutation[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryTreeMutation.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryTreeMutation.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryTreeMutation>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLQueryTreeMutation> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryTreeMutation.decode(p)]
        }
      } else {
        yield* [RGQLQueryTreeMutation.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryTreeMutation {
    return {
      queryId: isSet(object.queryId) ? globalThis.Number(object.queryId) : 0,
      nodeMutation: globalThis.Array.isArray(object?.nodeMutation)
        ? object.nodeMutation.map((e: any) =>
            RGQLQueryTreeMutation_NodeMutation.fromJSON(e),
          )
        : [],
      variables: globalThis.Array.isArray(object?.variables)
        ? object.variables.map((e: any) => ASTVariable.fromJSON(e))
        : [],
    }
  },

  toJSON(message: RGQLQueryTreeMutation): unknown {
    const obj: any = {}
    if (message.queryId !== 0) {
      obj.queryId = Math.round(message.queryId)
    }
    if (message.nodeMutation?.length) {
      obj.nodeMutation = message.nodeMutation.map((e) =>
        RGQLQueryTreeMutation_NodeMutation.toJSON(e),
      )
    }
    if (message.variables?.length) {
      obj.variables = message.variables.map((e) => ASTVariable.toJSON(e))
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLQueryTreeMutation>, I>>(
    base?: I,
  ): RGQLQueryTreeMutation {
    return RGQLQueryTreeMutation.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLQueryTreeMutation>, I>>(
    object: I,
  ): RGQLQueryTreeMutation {
    const message = createBaseRGQLQueryTreeMutation()
    message.queryId = object.queryId ?? 0
    message.nodeMutation =
      object.nodeMutation?.map((e) =>
        RGQLQueryTreeMutation_NodeMutation.fromPartial(e),
      ) || []
    message.variables =
      object.variables?.map((e) => ASTVariable.fromPartial(e)) || []
    return message
  },
}

function createBaseRGQLQueryTreeMutation_NodeMutation(): RGQLQueryTreeMutation_NodeMutation {
  return { nodeId: 0, operation: 0, node: undefined }
}

export const RGQLQueryTreeMutation_NodeMutation = {
  encode(
    message: RGQLQueryTreeMutation_NodeMutation,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.nodeId !== 0) {
      writer.uint32(8).uint32(message.nodeId)
    }
    if (message.operation !== 0) {
      writer.uint32(16).int32(message.operation)
    }
    if (message.node !== undefined) {
      RGQLQueryTreeNode.encode(message.node, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): RGQLQueryTreeMutation_NodeMutation {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryTreeMutation_NodeMutation()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.nodeId = reader.uint32()
          continue
        case 2:
          if (tag !== 16) {
            break
          }

          message.operation = reader.int32() as any
          continue
        case 3:
          if (tag !== 26) {
            break
          }

          message.node = RGQLQueryTreeNode.decode(reader, reader.uint32())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryTreeMutation_NodeMutation, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<
          | RGQLQueryTreeMutation_NodeMutation
          | RGQLQueryTreeMutation_NodeMutation[]
        >
      | Iterable<
          | RGQLQueryTreeMutation_NodeMutation
          | RGQLQueryTreeMutation_NodeMutation[]
        >,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryTreeMutation_NodeMutation.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryTreeMutation_NodeMutation.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryTreeMutation_NodeMutation>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLQueryTreeMutation_NodeMutation> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryTreeMutation_NodeMutation.decode(p)]
        }
      } else {
        yield* [RGQLQueryTreeMutation_NodeMutation.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryTreeMutation_NodeMutation {
    return {
      nodeId: isSet(object.nodeId) ? globalThis.Number(object.nodeId) : 0,
      operation: isSet(object.operation)
        ? rGQLQueryTreeMutation_SubtreeOperationFromJSON(object.operation)
        : 0,
      node: isSet(object.node)
        ? RGQLQueryTreeNode.fromJSON(object.node)
        : undefined,
    }
  },

  toJSON(message: RGQLQueryTreeMutation_NodeMutation): unknown {
    const obj: any = {}
    if (message.nodeId !== 0) {
      obj.nodeId = Math.round(message.nodeId)
    }
    if (message.operation !== 0) {
      obj.operation = rGQLQueryTreeMutation_SubtreeOperationToJSON(
        message.operation,
      )
    }
    if (message.node !== undefined) {
      obj.node = RGQLQueryTreeNode.toJSON(message.node)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLQueryTreeMutation_NodeMutation>, I>>(
    base?: I,
  ): RGQLQueryTreeMutation_NodeMutation {
    return RGQLQueryTreeMutation_NodeMutation.fromPartial(base ?? ({} as any))
  },
  fromPartial<
    I extends Exact<DeepPartial<RGQLQueryTreeMutation_NodeMutation>, I>,
  >(object: I): RGQLQueryTreeMutation_NodeMutation {
    const message = createBaseRGQLQueryTreeMutation_NodeMutation()
    message.nodeId = object.nodeId ?? 0
    message.operation = object.operation ?? 0
    message.node =
      object.node !== undefined && object.node !== null
        ? RGQLQueryTreeNode.fromPartial(object.node)
        : undefined
    return message
  },
}

function createBaseRGQLQueryFinish(): RGQLQueryFinish {
  return { queryId: 0 }
}

export const RGQLQueryFinish = {
  encode(
    message: RGQLQueryFinish,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.queryId !== 0) {
      writer.uint32(8).uint32(message.queryId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLQueryFinish {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryFinish()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.queryId = reader.uint32()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryFinish, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryFinish | RGQLQueryFinish[]>
      | Iterable<RGQLQueryFinish | RGQLQueryFinish[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryFinish.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryFinish.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryFinish>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLQueryFinish> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryFinish.decode(p)]
        }
      } else {
        yield* [RGQLQueryFinish.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryFinish {
    return {
      queryId: isSet(object.queryId) ? globalThis.Number(object.queryId) : 0,
    }
  },

  toJSON(message: RGQLQueryFinish): unknown {
    const obj: any = {}
    if (message.queryId !== 0) {
      obj.queryId = Math.round(message.queryId)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLQueryFinish>, I>>(
    base?: I,
  ): RGQLQueryFinish {
    return RGQLQueryFinish.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLQueryFinish>, I>>(
    object: I,
  ): RGQLQueryFinish {
    const message = createBaseRGQLQueryFinish()
    message.queryId = object.queryId ?? 0
    return message
  },
}

function createBaseRGQLServerMessage(): RGQLServerMessage {
  return {
    queryError: undefined,
    valueInit: undefined,
    valueBatch: undefined,
    valueFinalize: undefined,
  }
}

export const RGQLServerMessage = {
  encode(
    message: RGQLServerMessage,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.queryError !== undefined) {
      RGQLQueryError.encode(
        message.queryError,
        writer.uint32(18).fork(),
      ).ldelim()
    }
    if (message.valueInit !== undefined) {
      RGQLValueInit.encode(message.valueInit, writer.uint32(34).fork()).ldelim()
    }
    if (message.valueBatch !== undefined) {
      RGQLValueBatch.encode(
        message.valueBatch,
        writer.uint32(42).fork(),
      ).ldelim()
    }
    if (message.valueFinalize !== undefined) {
      RGQLValueFinalize.encode(
        message.valueFinalize,
        writer.uint32(50).fork(),
      ).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLServerMessage {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLServerMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break
          }

          message.queryError = RGQLQueryError.decode(reader, reader.uint32())
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.valueInit = RGQLValueInit.decode(reader, reader.uint32())
          continue
        case 5:
          if (tag !== 42) {
            break
          }

          message.valueBatch = RGQLValueBatch.decode(reader, reader.uint32())
          continue
        case 6:
          if (tag !== 50) {
            break
          }

          message.valueFinalize = RGQLValueFinalize.decode(
            reader,
            reader.uint32(),
          )
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLServerMessage, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLServerMessage | RGQLServerMessage[]>
      | Iterable<RGQLServerMessage | RGQLServerMessage[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLServerMessage.encode(p).finish()]
        }
      } else {
        yield* [RGQLServerMessage.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLServerMessage>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLServerMessage> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLServerMessage.decode(p)]
        }
      } else {
        yield* [RGQLServerMessage.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLServerMessage {
    return {
      queryError: isSet(object.queryError)
        ? RGQLQueryError.fromJSON(object.queryError)
        : undefined,
      valueInit: isSet(object.valueInit)
        ? RGQLValueInit.fromJSON(object.valueInit)
        : undefined,
      valueBatch: isSet(object.valueBatch)
        ? RGQLValueBatch.fromJSON(object.valueBatch)
        : undefined,
      valueFinalize: isSet(object.valueFinalize)
        ? RGQLValueFinalize.fromJSON(object.valueFinalize)
        : undefined,
    }
  },

  toJSON(message: RGQLServerMessage): unknown {
    const obj: any = {}
    if (message.queryError !== undefined) {
      obj.queryError = RGQLQueryError.toJSON(message.queryError)
    }
    if (message.valueInit !== undefined) {
      obj.valueInit = RGQLValueInit.toJSON(message.valueInit)
    }
    if (message.valueBatch !== undefined) {
      obj.valueBatch = RGQLValueBatch.toJSON(message.valueBatch)
    }
    if (message.valueFinalize !== undefined) {
      obj.valueFinalize = RGQLValueFinalize.toJSON(message.valueFinalize)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLServerMessage>, I>>(
    base?: I,
  ): RGQLServerMessage {
    return RGQLServerMessage.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLServerMessage>, I>>(
    object: I,
  ): RGQLServerMessage {
    const message = createBaseRGQLServerMessage()
    message.queryError =
      object.queryError !== undefined && object.queryError !== null
        ? RGQLQueryError.fromPartial(object.queryError)
        : undefined
    message.valueInit =
      object.valueInit !== undefined && object.valueInit !== null
        ? RGQLValueInit.fromPartial(object.valueInit)
        : undefined
    message.valueBatch =
      object.valueBatch !== undefined && object.valueBatch !== null
        ? RGQLValueBatch.fromPartial(object.valueBatch)
        : undefined
    message.valueFinalize =
      object.valueFinalize !== undefined && object.valueFinalize !== null
        ? RGQLValueFinalize.fromPartial(object.valueFinalize)
        : undefined
    return message
  },
}

function createBaseRGQLValueInit(): RGQLValueInit {
  return { resultId: 0, queryId: 0, cacheStrategy: 0, cacheSize: 0 }
}

export const RGQLValueInit = {
  encode(
    message: RGQLValueInit,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.resultId !== 0) {
      writer.uint32(8).uint32(message.resultId)
    }
    if (message.queryId !== 0) {
      writer.uint32(16).uint32(message.queryId)
    }
    if (message.cacheStrategy !== 0) {
      writer.uint32(24).int32(message.cacheStrategy)
    }
    if (message.cacheSize !== 0) {
      writer.uint32(32).uint32(message.cacheSize)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLValueInit {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLValueInit()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.resultId = reader.uint32()
          continue
        case 2:
          if (tag !== 16) {
            break
          }

          message.queryId = reader.uint32()
          continue
        case 3:
          if (tag !== 24) {
            break
          }

          message.cacheStrategy = reader.int32() as any
          continue
        case 4:
          if (tag !== 32) {
            break
          }

          message.cacheSize = reader.uint32()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLValueInit, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLValueInit | RGQLValueInit[]>
      | Iterable<RGQLValueInit | RGQLValueInit[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLValueInit.encode(p).finish()]
        }
      } else {
        yield* [RGQLValueInit.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLValueInit>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLValueInit> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLValueInit.decode(p)]
        }
      } else {
        yield* [RGQLValueInit.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLValueInit {
    return {
      resultId: isSet(object.resultId) ? globalThis.Number(object.resultId) : 0,
      queryId: isSet(object.queryId) ? globalThis.Number(object.queryId) : 0,
      cacheStrategy: isSet(object.cacheStrategy)
        ? rGQLValueInit_CacheStrategyFromJSON(object.cacheStrategy)
        : 0,
      cacheSize: isSet(object.cacheSize)
        ? globalThis.Number(object.cacheSize)
        : 0,
    }
  },

  toJSON(message: RGQLValueInit): unknown {
    const obj: any = {}
    if (message.resultId !== 0) {
      obj.resultId = Math.round(message.resultId)
    }
    if (message.queryId !== 0) {
      obj.queryId = Math.round(message.queryId)
    }
    if (message.cacheStrategy !== 0) {
      obj.cacheStrategy = rGQLValueInit_CacheStrategyToJSON(
        message.cacheStrategy,
      )
    }
    if (message.cacheSize !== 0) {
      obj.cacheSize = Math.round(message.cacheSize)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLValueInit>, I>>(
    base?: I,
  ): RGQLValueInit {
    return RGQLValueInit.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLValueInit>, I>>(
    object: I,
  ): RGQLValueInit {
    const message = createBaseRGQLValueInit()
    message.resultId = object.resultId ?? 0
    message.queryId = object.queryId ?? 0
    message.cacheStrategy = object.cacheStrategy ?? 0
    message.cacheSize = object.cacheSize ?? 0
    return message
  },
}

function createBaseRGQLValueFinalize(): RGQLValueFinalize {
  return { resultId: 0 }
}

export const RGQLValueFinalize = {
  encode(
    message: RGQLValueFinalize,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.resultId !== 0) {
      writer.uint32(8).uint32(message.resultId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLValueFinalize {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLValueFinalize()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.resultId = reader.uint32()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLValueFinalize, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLValueFinalize | RGQLValueFinalize[]>
      | Iterable<RGQLValueFinalize | RGQLValueFinalize[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLValueFinalize.encode(p).finish()]
        }
      } else {
        yield* [RGQLValueFinalize.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLValueFinalize>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLValueFinalize> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLValueFinalize.decode(p)]
        }
      } else {
        yield* [RGQLValueFinalize.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLValueFinalize {
    return {
      resultId: isSet(object.resultId) ? globalThis.Number(object.resultId) : 0,
    }
  },

  toJSON(message: RGQLValueFinalize): unknown {
    const obj: any = {}
    if (message.resultId !== 0) {
      obj.resultId = Math.round(message.resultId)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLValueFinalize>, I>>(
    base?: I,
  ): RGQLValueFinalize {
    return RGQLValueFinalize.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLValueFinalize>, I>>(
    object: I,
  ): RGQLValueFinalize {
    const message = createBaseRGQLValueFinalize()
    message.resultId = object.resultId ?? 0
    return message
  },
}

function createBaseRGQLQueryError(): RGQLQueryError {
  return { queryId: 0, queryNodeId: 0, error: '' }
}

export const RGQLQueryError = {
  encode(
    message: RGQLQueryError,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.queryId !== 0) {
      writer.uint32(8).uint32(message.queryId)
    }
    if (message.queryNodeId !== 0) {
      writer.uint32(16).uint32(message.queryNodeId)
    }
    if (message.error !== '') {
      writer.uint32(26).string(message.error)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLQueryError {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryError()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.queryId = reader.uint32()
          continue
        case 2:
          if (tag !== 16) {
            break
          }

          message.queryNodeId = reader.uint32()
          continue
        case 3:
          if (tag !== 26) {
            break
          }

          message.error = reader.string()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryError, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryError | RGQLQueryError[]>
      | Iterable<RGQLQueryError | RGQLQueryError[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryError.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryError.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryError>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLQueryError> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLQueryError.decode(p)]
        }
      } else {
        yield* [RGQLQueryError.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryError {
    return {
      queryId: isSet(object.queryId) ? globalThis.Number(object.queryId) : 0,
      queryNodeId: isSet(object.queryNodeId)
        ? globalThis.Number(object.queryNodeId)
        : 0,
      error: isSet(object.error) ? globalThis.String(object.error) : '',
    }
  },

  toJSON(message: RGQLQueryError): unknown {
    const obj: any = {}
    if (message.queryId !== 0) {
      obj.queryId = Math.round(message.queryId)
    }
    if (message.queryNodeId !== 0) {
      obj.queryNodeId = Math.round(message.queryNodeId)
    }
    if (message.error !== '') {
      obj.error = message.error
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLQueryError>, I>>(
    base?: I,
  ): RGQLQueryError {
    return RGQLQueryError.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLQueryError>, I>>(
    object: I,
  ): RGQLQueryError {
    const message = createBaseRGQLQueryError()
    message.queryId = object.queryId ?? 0
    message.queryNodeId = object.queryNodeId ?? 0
    message.error = object.error ?? ''
    return message
  },
}

function createBaseRGQLValue(): RGQLValue {
  return {
    queryNodeId: 0,
    arrayIndex: 0,
    posIdentifier: 0,
    value: undefined,
    error: '',
  }
}

export const RGQLValue = {
  encode(
    message: RGQLValue,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.queryNodeId !== 0) {
      writer.uint32(8).uint32(message.queryNodeId)
    }
    if (message.arrayIndex !== 0) {
      writer.uint32(16).uint32(message.arrayIndex)
    }
    if (message.posIdentifier !== 0) {
      writer.uint32(24).uint32(message.posIdentifier)
    }
    if (message.value !== undefined) {
      RGQLPrimitive.encode(message.value, writer.uint32(34).fork()).ldelim()
    }
    if (message.error !== '') {
      writer.uint32(42).string(message.error)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLValue {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLValue()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.queryNodeId = reader.uint32()
          continue
        case 2:
          if (tag !== 16) {
            break
          }

          message.arrayIndex = reader.uint32()
          continue
        case 3:
          if (tag !== 24) {
            break
          }

          message.posIdentifier = reader.uint32()
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.value = RGQLPrimitive.decode(reader, reader.uint32())
          continue
        case 5:
          if (tag !== 42) {
            break
          }

          message.error = reader.string()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLValue, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLValue | RGQLValue[]>
      | Iterable<RGQLValue | RGQLValue[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLValue.encode(p).finish()]
        }
      } else {
        yield* [RGQLValue.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLValue>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLValue> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLValue.decode(p)]
        }
      } else {
        yield* [RGQLValue.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLValue {
    return {
      queryNodeId: isSet(object.queryNodeId)
        ? globalThis.Number(object.queryNodeId)
        : 0,
      arrayIndex: isSet(object.arrayIndex)
        ? globalThis.Number(object.arrayIndex)
        : 0,
      posIdentifier: isSet(object.posIdentifier)
        ? globalThis.Number(object.posIdentifier)
        : 0,
      value: isSet(object.value)
        ? RGQLPrimitive.fromJSON(object.value)
        : undefined,
      error: isSet(object.error) ? globalThis.String(object.error) : '',
    }
  },

  toJSON(message: RGQLValue): unknown {
    const obj: any = {}
    if (message.queryNodeId !== 0) {
      obj.queryNodeId = Math.round(message.queryNodeId)
    }
    if (message.arrayIndex !== 0) {
      obj.arrayIndex = Math.round(message.arrayIndex)
    }
    if (message.posIdentifier !== 0) {
      obj.posIdentifier = Math.round(message.posIdentifier)
    }
    if (message.value !== undefined) {
      obj.value = RGQLPrimitive.toJSON(message.value)
    }
    if (message.error !== '') {
      obj.error = message.error
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLValue>, I>>(base?: I): RGQLValue {
    return RGQLValue.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLValue>, I>>(
    object: I,
  ): RGQLValue {
    const message = createBaseRGQLValue()
    message.queryNodeId = object.queryNodeId ?? 0
    message.arrayIndex = object.arrayIndex ?? 0
    message.posIdentifier = object.posIdentifier ?? 0
    message.value =
      object.value !== undefined && object.value !== null
        ? RGQLPrimitive.fromPartial(object.value)
        : undefined
    message.error = object.error ?? ''
    return message
  },
}

function createBaseRGQLValueBatch(): RGQLValueBatch {
  return { resultId: 0, values: [] }
}

export const RGQLValueBatch = {
  encode(
    message: RGQLValueBatch,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.resultId !== 0) {
      writer.uint32(8).uint32(message.resultId)
    }
    for (const v of message.values) {
      writer.uint32(18).bytes(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLValueBatch {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLValueBatch()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.resultId = reader.uint32()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.values.push(reader.bytes())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLValueBatch, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLValueBatch | RGQLValueBatch[]>
      | Iterable<RGQLValueBatch | RGQLValueBatch[]>,
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLValueBatch.encode(p).finish()]
        }
      } else {
        yield* [RGQLValueBatch.encode(pkt as any).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLValueBatch>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>,
  ): AsyncIterable<RGQLValueBatch> {
    for await (const pkt of source) {
      if (globalThis.Array.isArray(pkt)) {
        for (const p of pkt as any) {
          yield* [RGQLValueBatch.decode(p)]
        }
      } else {
        yield* [RGQLValueBatch.decode(pkt as any)]
      }
    }
  },

  fromJSON(object: any): RGQLValueBatch {
    return {
      resultId: isSet(object.resultId) ? globalThis.Number(object.resultId) : 0,
      values: globalThis.Array.isArray(object?.values)
        ? object.values.map((e: any) => bytesFromBase64(e))
        : [],
    }
  },

  toJSON(message: RGQLValueBatch): unknown {
    const obj: any = {}
    if (message.resultId !== 0) {
      obj.resultId = Math.round(message.resultId)
    }
    if (message.values?.length) {
      obj.values = message.values.map((e) => base64FromBytes(e))
    }
    return obj
  },

  create<I extends Exact<DeepPartial<RGQLValueBatch>, I>>(
    base?: I,
  ): RGQLValueBatch {
    return RGQLValueBatch.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<RGQLValueBatch>, I>>(
    object: I,
  ): RGQLValueBatch {
    const message = createBaseRGQLValueBatch()
    message.resultId = object.resultId ?? 0
    message.values = object.values?.map((e) => e) || []
    return message
  },
}

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, 'base64'))
  } else {
    const bin = globalThis.atob(b64)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i)
    }
    return arr
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString('base64')
  } else {
    const bin: string[] = []
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte))
    })
    return globalThis.btoa(bin.join(''))
  }
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
    ? string | number | Long
    : T extends globalThis.Array<infer U>
      ? globalThis.Array<DeepPartial<U>>
      : T extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : T extends { $case: string }
          ? { [K in keyof Omit<T, '$case'>]?: DeepPartial<T[K]> } & {
              $case: T['$case']
            }
          : T extends {}
            ? { [K in keyof T]?: DeepPartial<T[K]> }
            : Partial<T>

type KeysOfUnion<T> = T extends T ? keyof T : never
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never
    }

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
