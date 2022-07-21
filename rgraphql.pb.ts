/* eslint-disable */
import Long from 'long'
import _m0 from 'protobufjs/minimal.js'

export const protobufPackage = 'rgraphql'

export interface RGQLQueryFieldDirective {
  /** Directive name */
  name?: string
  /** Optional arguments. */
  args?: FieldArgument[]
}

export interface RGQLQueryTreeNode {
  /** Integer ID of the node. */
  id?: number
  /** Name of the field this node represents. */
  fieldName?: string
  /** Arguments. */
  args?: FieldArgument[]
  /** Directives */
  directive?: RGQLQueryFieldDirective[]
  /** Children */
  children?: RGQLQueryTreeNode[]
}

export interface FieldArgument {
  name?: string
  variableId?: number
}

export interface ASTVariable {
  id?: number
  value?: RGQLPrimitive
}

export interface RGQLPrimitive {
  kind?: RGQLPrimitive_Kind
  intValue?: number
  floatValue?: number
  stringValue?: string
  boolValue?: boolean
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
  initQuery?: RGQLQueryInit
  mutateTree?: RGQLQueryTreeMutation
  finishQuery?: RGQLQueryFinish
}

export interface RGQLQueryInit {
  /** The ID of this query. */
  queryId?: number
  /**
   * Force serial for this query?
   * Note: serial queries execute as soon as the first mutation arrives, and cannot be updated.
   */
  forceSerial?: boolean
  /** Operation type, i.e. query, mutation, etc. */
  operationType?: string
}

export interface RGQLQueryTreeMutation {
  /** The ID of this query. */
  queryId?: number
  /** All node mutations in this step. */
  nodeMutation?: RGQLQueryTreeMutation_NodeMutation[]
  /** Any new variables. */
  variables?: ASTVariable[]
}

export enum RGQLQueryTreeMutation_SubtreeOperation {
  /** SUBTREE_ADD_CHILD - Add a child tree to the subtree. */
  SUBTREE_ADD_CHILD = 0,
  /** SUBTREE_DELETE - Delete a tree node and all children. */
  SUBTREE_DELETE = 1,
  UNRECOGNIZED = -1,
}

export function rGQLQueryTreeMutation_SubtreeOperationFromJSON(
  object: any
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
  object: RGQLQueryTreeMutation_SubtreeOperation
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
  nodeId?: number
  /** Operation we are taking. */
  operation?: RGQLQueryTreeMutation_SubtreeOperation
  /** The new node tree to add, if we are adding a child. */
  node?: RGQLQueryTreeNode
}

export interface RGQLQueryFinish {
  /** The ID of this query. */
  queryId?: number
}

export interface RGQLServerMessage {
  queryError?: RGQLQueryError
  valueInit?: RGQLValueInit
  valueBatch?: RGQLValueBatch
  valueFinalize?: RGQLValueFinalize
}

/** RGQLValueInit initializes a result value tree. */
export interface RGQLValueInit {
  /** result_id is the identifier for the result tree. */
  resultId?: number
  /** query_id is the identifier for the corresponding query. */
  queryId?: number
  /** cache_strategy is the strategy used for the path cache. */
  cacheStrategy?: RGQLValueInit_CacheStrategy
  /** cache_size is the size of the path cache, if necessary. */
  cacheSize?: number
}

export enum RGQLValueInit_CacheStrategy {
  CACHE_LRU = 0,
  UNRECOGNIZED = -1,
}

export function rGQLValueInit_CacheStrategyFromJSON(
  object: any
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
  object: RGQLValueInit_CacheStrategy
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
  resultId?: number
}

/** Communicating a failure in the input query. */
export interface RGQLQueryError {
  queryId?: number
  queryNodeId?: number
  error?: string
}

export interface RGQLValue {
  /** The ID of the field in the query tree, if a field. */
  queryNodeId?: number
  /** The 1-based index, if an array element. */
  arrayIndex?: number
  /**
   * If this is a 0-th index value, this is a pointer to a previous identifier.
   * Otherwise, this is an identifier for adding an alias to this path.
   */
  posIdentifier?: number
  /** The value, if we have one. */
  value?: RGQLPrimitive
  /** The error, if we are erroring this field. */
  error?: string
}

export interface RGQLValueBatch {
  /** The ID of the result tree this batch is for. */
  resultId?: number
  /** The batch of RGQLValue values, encoded. */
  values?: Uint8Array[]
}

function createBaseRGQLQueryFieldDirective(): RGQLQueryFieldDirective {
  return { name: '', args: [] }
}

export const RGQLQueryFieldDirective = {
  encode(
    message: RGQLQueryFieldDirective,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== undefined && message.name !== '') {
      writer.uint32(10).string(message.name)
    }
    if (message.args !== undefined && message.args.length !== 0) {
      for (const v of message.args) {
        FieldArgument.encode(v!, writer.uint32(18).fork()).ldelim()
      }
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): RGQLQueryFieldDirective {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryFieldDirective()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string()
          break
        case 2:
          message.args!.push(FieldArgument.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryFieldDirective, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryFieldDirective | RGQLQueryFieldDirective[]>
      | Iterable<RGQLQueryFieldDirective | RGQLQueryFieldDirective[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryFieldDirective.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryFieldDirective.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryFieldDirective>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLQueryFieldDirective> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryFieldDirective.decode(p)]
        }
      } else {
        yield* [RGQLQueryFieldDirective.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryFieldDirective {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      args: Array.isArray(object?.args)
        ? object.args.map((e: any) => FieldArgument.fromJSON(e))
        : [],
    }
  },

  toJSON(message: RGQLQueryFieldDirective): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    if (message.args) {
      obj.args = message.args.map((e) =>
        e ? FieldArgument.toJSON(e) : undefined
      )
    } else {
      obj.args = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLQueryFieldDirective>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== undefined && message.id !== 0) {
      writer.uint32(8).uint32(message.id)
    }
    if (message.fieldName !== undefined && message.fieldName !== '') {
      writer.uint32(18).string(message.fieldName)
    }
    if (message.args !== undefined && message.args.length !== 0) {
      for (const v of message.args) {
        FieldArgument.encode(v!, writer.uint32(26).fork()).ldelim()
      }
    }
    if (message.directive !== undefined && message.directive.length !== 0) {
      for (const v of message.directive) {
        RGQLQueryFieldDirective.encode(v!, writer.uint32(34).fork()).ldelim()
      }
    }
    if (message.children !== undefined && message.children.length !== 0) {
      for (const v of message.children) {
        RGQLQueryTreeNode.encode(v!, writer.uint32(42).fork()).ldelim()
      }
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLQueryTreeNode {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryTreeNode()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint32()
          break
        case 2:
          message.fieldName = reader.string()
          break
        case 3:
          message.args!.push(FieldArgument.decode(reader, reader.uint32()))
          break
        case 4:
          message.directive!.push(
            RGQLQueryFieldDirective.decode(reader, reader.uint32())
          )
          break
        case 5:
          message.children!.push(
            RGQLQueryTreeNode.decode(reader, reader.uint32())
          )
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryTreeNode, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryTreeNode | RGQLQueryTreeNode[]>
      | Iterable<RGQLQueryTreeNode | RGQLQueryTreeNode[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryTreeNode.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryTreeNode.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryTreeNode>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLQueryTreeNode> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryTreeNode.decode(p)]
        }
      } else {
        yield* [RGQLQueryTreeNode.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryTreeNode {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      fieldName: isSet(object.fieldName) ? String(object.fieldName) : '',
      args: Array.isArray(object?.args)
        ? object.args.map((e: any) => FieldArgument.fromJSON(e))
        : [],
      directive: Array.isArray(object?.directive)
        ? object.directive.map((e: any) => RGQLQueryFieldDirective.fromJSON(e))
        : [],
      children: Array.isArray(object?.children)
        ? object.children.map((e: any) => RGQLQueryTreeNode.fromJSON(e))
        : [],
    }
  },

  toJSON(message: RGQLQueryTreeNode): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = Math.round(message.id))
    message.fieldName !== undefined && (obj.fieldName = message.fieldName)
    if (message.args) {
      obj.args = message.args.map((e) =>
        e ? FieldArgument.toJSON(e) : undefined
      )
    } else {
      obj.args = []
    }
    if (message.directive) {
      obj.directive = message.directive.map((e) =>
        e ? RGQLQueryFieldDirective.toJSON(e) : undefined
      )
    } else {
      obj.directive = []
    }
    if (message.children) {
      obj.children = message.children.map((e) =>
        e ? RGQLQueryTreeNode.toJSON(e) : undefined
      )
    } else {
      obj.children = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLQueryTreeNode>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== undefined && message.name !== '') {
      writer.uint32(10).string(message.name)
    }
    if (message.variableId !== undefined && message.variableId !== 0) {
      writer.uint32(16).uint32(message.variableId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FieldArgument {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseFieldArgument()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string()
          break
        case 2:
          message.variableId = reader.uint32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<FieldArgument, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<FieldArgument | FieldArgument[]>
      | Iterable<FieldArgument | FieldArgument[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [FieldArgument.encode(p).finish()]
        }
      } else {
        yield* [FieldArgument.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, FieldArgument>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<FieldArgument> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [FieldArgument.decode(p)]
        }
      } else {
        yield* [FieldArgument.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): FieldArgument {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      variableId: isSet(object.variableId) ? Number(object.variableId) : 0,
    }
  },

  toJSON(message: FieldArgument): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.variableId !== undefined &&
      (obj.variableId = Math.round(message.variableId))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<FieldArgument>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== undefined && message.id !== 0) {
      writer.uint32(8).uint32(message.id)
    }
    if (message.value !== undefined) {
      RGQLPrimitive.encode(message.value, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ASTVariable {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseASTVariable()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint32()
          break
        case 2:
          message.value = RGQLPrimitive.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<ASTVariable, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<ASTVariable | ASTVariable[]>
      | Iterable<ASTVariable | ASTVariable[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [ASTVariable.encode(p).finish()]
        }
      } else {
        yield* [ASTVariable.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, ASTVariable>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<ASTVariable> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [ASTVariable.decode(p)]
        }
      } else {
        yield* [ASTVariable.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): ASTVariable {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      value: isSet(object.value)
        ? RGQLPrimitive.fromJSON(object.value)
        : undefined,
    }
  },

  toJSON(message: ASTVariable): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = Math.round(message.id))
    message.value !== undefined &&
      (obj.value = message.value
        ? RGQLPrimitive.toJSON(message.value)
        : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ASTVariable>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.kind !== undefined && message.kind !== 0) {
      writer.uint32(8).int32(message.kind)
    }
    if (message.intValue !== undefined && message.intValue !== 0) {
      writer.uint32(16).int32(message.intValue)
    }
    if (message.floatValue !== undefined && message.floatValue !== 0) {
      writer.uint32(25).double(message.floatValue)
    }
    if (message.stringValue !== undefined && message.stringValue !== '') {
      writer.uint32(34).string(message.stringValue)
    }
    if (message.boolValue === true) {
      writer.uint32(40).bool(message.boolValue)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLPrimitive {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLPrimitive()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.kind = reader.int32() as any
          break
        case 2:
          message.intValue = reader.int32()
          break
        case 3:
          message.floatValue = reader.double()
          break
        case 4:
          message.stringValue = reader.string()
          break
        case 5:
          message.boolValue = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLPrimitive, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLPrimitive | RGQLPrimitive[]>
      | Iterable<RGQLPrimitive | RGQLPrimitive[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLPrimitive.encode(p).finish()]
        }
      } else {
        yield* [RGQLPrimitive.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLPrimitive>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLPrimitive> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLPrimitive.decode(p)]
        }
      } else {
        yield* [RGQLPrimitive.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLPrimitive {
    return {
      kind: isSet(object.kind) ? rGQLPrimitive_KindFromJSON(object.kind) : 0,
      intValue: isSet(object.intValue) ? Number(object.intValue) : 0,
      floatValue: isSet(object.floatValue) ? Number(object.floatValue) : 0,
      stringValue: isSet(object.stringValue) ? String(object.stringValue) : '',
      boolValue: isSet(object.boolValue) ? Boolean(object.boolValue) : false,
    }
  },

  toJSON(message: RGQLPrimitive): unknown {
    const obj: any = {}
    message.kind !== undefined &&
      (obj.kind = rGQLPrimitive_KindToJSON(message.kind))
    message.intValue !== undefined &&
      (obj.intValue = Math.round(message.intValue))
    message.floatValue !== undefined && (obj.floatValue = message.floatValue)
    message.stringValue !== undefined && (obj.stringValue = message.stringValue)
    message.boolValue !== undefined && (obj.boolValue = message.boolValue)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLPrimitive>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.initQuery !== undefined) {
      RGQLQueryInit.encode(message.initQuery, writer.uint32(10).fork()).ldelim()
    }
    if (message.mutateTree !== undefined) {
      RGQLQueryTreeMutation.encode(
        message.mutateTree,
        writer.uint32(18).fork()
      ).ldelim()
    }
    if (message.finishQuery !== undefined) {
      RGQLQueryFinish.encode(
        message.finishQuery,
        writer.uint32(26).fork()
      ).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLClientMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLClientMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.initQuery = RGQLQueryInit.decode(reader, reader.uint32())
          break
        case 2:
          message.mutateTree = RGQLQueryTreeMutation.decode(
            reader,
            reader.uint32()
          )
          break
        case 3:
          message.finishQuery = RGQLQueryFinish.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLClientMessage, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLClientMessage | RGQLClientMessage[]>
      | Iterable<RGQLClientMessage | RGQLClientMessage[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLClientMessage.encode(p).finish()]
        }
      } else {
        yield* [RGQLClientMessage.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLClientMessage>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLClientMessage> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLClientMessage.decode(p)]
        }
      } else {
        yield* [RGQLClientMessage.decode(pkt)]
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
    message.initQuery !== undefined &&
      (obj.initQuery = message.initQuery
        ? RGQLQueryInit.toJSON(message.initQuery)
        : undefined)
    message.mutateTree !== undefined &&
      (obj.mutateTree = message.mutateTree
        ? RGQLQueryTreeMutation.toJSON(message.mutateTree)
        : undefined)
    message.finishQuery !== undefined &&
      (obj.finishQuery = message.finishQuery
        ? RGQLQueryFinish.toJSON(message.finishQuery)
        : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLClientMessage>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.queryId !== undefined && message.queryId !== 0) {
      writer.uint32(8).uint32(message.queryId)
    }
    if (message.forceSerial === true) {
      writer.uint32(16).bool(message.forceSerial)
    }
    if (message.operationType !== undefined && message.operationType !== '') {
      writer.uint32(26).string(message.operationType)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLQueryInit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryInit()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.queryId = reader.uint32()
          break
        case 2:
          message.forceSerial = reader.bool()
          break
        case 3:
          message.operationType = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryInit, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryInit | RGQLQueryInit[]>
      | Iterable<RGQLQueryInit | RGQLQueryInit[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryInit.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryInit.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryInit>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLQueryInit> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryInit.decode(p)]
        }
      } else {
        yield* [RGQLQueryInit.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryInit {
    return {
      queryId: isSet(object.queryId) ? Number(object.queryId) : 0,
      forceSerial: isSet(object.forceSerial)
        ? Boolean(object.forceSerial)
        : false,
      operationType: isSet(object.operationType)
        ? String(object.operationType)
        : '',
    }
  },

  toJSON(message: RGQLQueryInit): unknown {
    const obj: any = {}
    message.queryId !== undefined && (obj.queryId = Math.round(message.queryId))
    message.forceSerial !== undefined && (obj.forceSerial = message.forceSerial)
    message.operationType !== undefined &&
      (obj.operationType = message.operationType)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLQueryInit>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.queryId !== undefined && message.queryId !== 0) {
      writer.uint32(8).uint32(message.queryId)
    }
    if (
      message.nodeMutation !== undefined &&
      message.nodeMutation.length !== 0
    ) {
      for (const v of message.nodeMutation) {
        RGQLQueryTreeMutation_NodeMutation.encode(
          v!,
          writer.uint32(18).fork()
        ).ldelim()
      }
    }
    if (message.variables !== undefined && message.variables.length !== 0) {
      for (const v of message.variables) {
        ASTVariable.encode(v!, writer.uint32(26).fork()).ldelim()
      }
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): RGQLQueryTreeMutation {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryTreeMutation()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.queryId = reader.uint32()
          break
        case 2:
          message.nodeMutation!.push(
            RGQLQueryTreeMutation_NodeMutation.decode(reader, reader.uint32())
          )
          break
        case 3:
          message.variables!.push(ASTVariable.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryTreeMutation, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryTreeMutation | RGQLQueryTreeMutation[]>
      | Iterable<RGQLQueryTreeMutation | RGQLQueryTreeMutation[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryTreeMutation.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryTreeMutation.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryTreeMutation>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLQueryTreeMutation> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryTreeMutation.decode(p)]
        }
      } else {
        yield* [RGQLQueryTreeMutation.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryTreeMutation {
    return {
      queryId: isSet(object.queryId) ? Number(object.queryId) : 0,
      nodeMutation: Array.isArray(object?.nodeMutation)
        ? object.nodeMutation.map((e: any) =>
            RGQLQueryTreeMutation_NodeMutation.fromJSON(e)
          )
        : [],
      variables: Array.isArray(object?.variables)
        ? object.variables.map((e: any) => ASTVariable.fromJSON(e))
        : [],
    }
  },

  toJSON(message: RGQLQueryTreeMutation): unknown {
    const obj: any = {}
    message.queryId !== undefined && (obj.queryId = Math.round(message.queryId))
    if (message.nodeMutation) {
      obj.nodeMutation = message.nodeMutation.map((e) =>
        e ? RGQLQueryTreeMutation_NodeMutation.toJSON(e) : undefined
      )
    } else {
      obj.nodeMutation = []
    }
    if (message.variables) {
      obj.variables = message.variables.map((e) =>
        e ? ASTVariable.toJSON(e) : undefined
      )
    } else {
      obj.variables = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLQueryTreeMutation>, I>>(
    object: I
  ): RGQLQueryTreeMutation {
    const message = createBaseRGQLQueryTreeMutation()
    message.queryId = object.queryId ?? 0
    message.nodeMutation =
      object.nodeMutation?.map((e) =>
        RGQLQueryTreeMutation_NodeMutation.fromPartial(e)
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.nodeId !== undefined && message.nodeId !== 0) {
      writer.uint32(8).uint32(message.nodeId)
    }
    if (message.operation !== undefined && message.operation !== 0) {
      writer.uint32(16).int32(message.operation)
    }
    if (message.node !== undefined) {
      RGQLQueryTreeNode.encode(message.node, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): RGQLQueryTreeMutation_NodeMutation {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryTreeMutation_NodeMutation()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.nodeId = reader.uint32()
          break
        case 2:
          message.operation = reader.int32() as any
          break
        case 3:
          message.node = RGQLQueryTreeNode.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
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
        >
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryTreeMutation_NodeMutation.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryTreeMutation_NodeMutation.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryTreeMutation_NodeMutation>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLQueryTreeMutation_NodeMutation> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryTreeMutation_NodeMutation.decode(p)]
        }
      } else {
        yield* [RGQLQueryTreeMutation_NodeMutation.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryTreeMutation_NodeMutation {
    return {
      nodeId: isSet(object.nodeId) ? Number(object.nodeId) : 0,
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
    message.nodeId !== undefined && (obj.nodeId = Math.round(message.nodeId))
    message.operation !== undefined &&
      (obj.operation = rGQLQueryTreeMutation_SubtreeOperationToJSON(
        message.operation
      ))
    message.node !== undefined &&
      (obj.node = message.node
        ? RGQLQueryTreeNode.toJSON(message.node)
        : undefined)
    return obj
  },

  fromPartial<
    I extends Exact<DeepPartial<RGQLQueryTreeMutation_NodeMutation>, I>
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.queryId !== undefined && message.queryId !== 0) {
      writer.uint32(8).uint32(message.queryId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLQueryFinish {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryFinish()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.queryId = reader.uint32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryFinish, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryFinish | RGQLQueryFinish[]>
      | Iterable<RGQLQueryFinish | RGQLQueryFinish[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryFinish.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryFinish.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryFinish>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLQueryFinish> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryFinish.decode(p)]
        }
      } else {
        yield* [RGQLQueryFinish.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryFinish {
    return {
      queryId: isSet(object.queryId) ? Number(object.queryId) : 0,
    }
  },

  toJSON(message: RGQLQueryFinish): unknown {
    const obj: any = {}
    message.queryId !== undefined && (obj.queryId = Math.round(message.queryId))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLQueryFinish>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.queryError !== undefined) {
      RGQLQueryError.encode(
        message.queryError,
        writer.uint32(18).fork()
      ).ldelim()
    }
    if (message.valueInit !== undefined) {
      RGQLValueInit.encode(message.valueInit, writer.uint32(34).fork()).ldelim()
    }
    if (message.valueBatch !== undefined) {
      RGQLValueBatch.encode(
        message.valueBatch,
        writer.uint32(42).fork()
      ).ldelim()
    }
    if (message.valueFinalize !== undefined) {
      RGQLValueFinalize.encode(
        message.valueFinalize,
        writer.uint32(50).fork()
      ).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLServerMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLServerMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.queryError = RGQLQueryError.decode(reader, reader.uint32())
          break
        case 4:
          message.valueInit = RGQLValueInit.decode(reader, reader.uint32())
          break
        case 5:
          message.valueBatch = RGQLValueBatch.decode(reader, reader.uint32())
          break
        case 6:
          message.valueFinalize = RGQLValueFinalize.decode(
            reader,
            reader.uint32()
          )
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLServerMessage, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLServerMessage | RGQLServerMessage[]>
      | Iterable<RGQLServerMessage | RGQLServerMessage[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLServerMessage.encode(p).finish()]
        }
      } else {
        yield* [RGQLServerMessage.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLServerMessage>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLServerMessage> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLServerMessage.decode(p)]
        }
      } else {
        yield* [RGQLServerMessage.decode(pkt)]
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
    message.queryError !== undefined &&
      (obj.queryError = message.queryError
        ? RGQLQueryError.toJSON(message.queryError)
        : undefined)
    message.valueInit !== undefined &&
      (obj.valueInit = message.valueInit
        ? RGQLValueInit.toJSON(message.valueInit)
        : undefined)
    message.valueBatch !== undefined &&
      (obj.valueBatch = message.valueBatch
        ? RGQLValueBatch.toJSON(message.valueBatch)
        : undefined)
    message.valueFinalize !== undefined &&
      (obj.valueFinalize = message.valueFinalize
        ? RGQLValueFinalize.toJSON(message.valueFinalize)
        : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLServerMessage>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.resultId !== undefined && message.resultId !== 0) {
      writer.uint32(8).uint32(message.resultId)
    }
    if (message.queryId !== undefined && message.queryId !== 0) {
      writer.uint32(16).uint32(message.queryId)
    }
    if (message.cacheStrategy !== undefined && message.cacheStrategy !== 0) {
      writer.uint32(24).int32(message.cacheStrategy)
    }
    if (message.cacheSize !== undefined && message.cacheSize !== 0) {
      writer.uint32(32).uint32(message.cacheSize)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLValueInit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLValueInit()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.resultId = reader.uint32()
          break
        case 2:
          message.queryId = reader.uint32()
          break
        case 3:
          message.cacheStrategy = reader.int32() as any
          break
        case 4:
          message.cacheSize = reader.uint32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLValueInit, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLValueInit | RGQLValueInit[]>
      | Iterable<RGQLValueInit | RGQLValueInit[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLValueInit.encode(p).finish()]
        }
      } else {
        yield* [RGQLValueInit.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLValueInit>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLValueInit> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLValueInit.decode(p)]
        }
      } else {
        yield* [RGQLValueInit.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLValueInit {
    return {
      resultId: isSet(object.resultId) ? Number(object.resultId) : 0,
      queryId: isSet(object.queryId) ? Number(object.queryId) : 0,
      cacheStrategy: isSet(object.cacheStrategy)
        ? rGQLValueInit_CacheStrategyFromJSON(object.cacheStrategy)
        : 0,
      cacheSize: isSet(object.cacheSize) ? Number(object.cacheSize) : 0,
    }
  },

  toJSON(message: RGQLValueInit): unknown {
    const obj: any = {}
    message.resultId !== undefined &&
      (obj.resultId = Math.round(message.resultId))
    message.queryId !== undefined && (obj.queryId = Math.round(message.queryId))
    message.cacheStrategy !== undefined &&
      (obj.cacheStrategy = rGQLValueInit_CacheStrategyToJSON(
        message.cacheStrategy
      ))
    message.cacheSize !== undefined &&
      (obj.cacheSize = Math.round(message.cacheSize))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLValueInit>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.resultId !== undefined && message.resultId !== 0) {
      writer.uint32(8).uint32(message.resultId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLValueFinalize {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLValueFinalize()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.resultId = reader.uint32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLValueFinalize, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLValueFinalize | RGQLValueFinalize[]>
      | Iterable<RGQLValueFinalize | RGQLValueFinalize[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLValueFinalize.encode(p).finish()]
        }
      } else {
        yield* [RGQLValueFinalize.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLValueFinalize>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLValueFinalize> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLValueFinalize.decode(p)]
        }
      } else {
        yield* [RGQLValueFinalize.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLValueFinalize {
    return {
      resultId: isSet(object.resultId) ? Number(object.resultId) : 0,
    }
  },

  toJSON(message: RGQLValueFinalize): unknown {
    const obj: any = {}
    message.resultId !== undefined &&
      (obj.resultId = Math.round(message.resultId))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLValueFinalize>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.queryId !== undefined && message.queryId !== 0) {
      writer.uint32(8).uint32(message.queryId)
    }
    if (message.queryNodeId !== undefined && message.queryNodeId !== 0) {
      writer.uint32(16).uint32(message.queryNodeId)
    }
    if (message.error !== undefined && message.error !== '') {
      writer.uint32(26).string(message.error)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLQueryError {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLQueryError()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.queryId = reader.uint32()
          break
        case 2:
          message.queryNodeId = reader.uint32()
          break
        case 3:
          message.error = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLQueryError, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLQueryError | RGQLQueryError[]>
      | Iterable<RGQLQueryError | RGQLQueryError[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryError.encode(p).finish()]
        }
      } else {
        yield* [RGQLQueryError.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLQueryError>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLQueryError> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLQueryError.decode(p)]
        }
      } else {
        yield* [RGQLQueryError.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLQueryError {
    return {
      queryId: isSet(object.queryId) ? Number(object.queryId) : 0,
      queryNodeId: isSet(object.queryNodeId) ? Number(object.queryNodeId) : 0,
      error: isSet(object.error) ? String(object.error) : '',
    }
  },

  toJSON(message: RGQLQueryError): unknown {
    const obj: any = {}
    message.queryId !== undefined && (obj.queryId = Math.round(message.queryId))
    message.queryNodeId !== undefined &&
      (obj.queryNodeId = Math.round(message.queryNodeId))
    message.error !== undefined && (obj.error = message.error)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLQueryError>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.queryNodeId !== undefined && message.queryNodeId !== 0) {
      writer.uint32(8).uint32(message.queryNodeId)
    }
    if (message.arrayIndex !== undefined && message.arrayIndex !== 0) {
      writer.uint32(16).uint32(message.arrayIndex)
    }
    if (message.posIdentifier !== undefined && message.posIdentifier !== 0) {
      writer.uint32(24).uint32(message.posIdentifier)
    }
    if (message.value !== undefined) {
      RGQLPrimitive.encode(message.value, writer.uint32(34).fork()).ldelim()
    }
    if (message.error !== undefined && message.error !== '') {
      writer.uint32(42).string(message.error)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLValue()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.queryNodeId = reader.uint32()
          break
        case 2:
          message.arrayIndex = reader.uint32()
          break
        case 3:
          message.posIdentifier = reader.uint32()
          break
        case 4:
          message.value = RGQLPrimitive.decode(reader, reader.uint32())
          break
        case 5:
          message.error = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLValue, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLValue | RGQLValue[]>
      | Iterable<RGQLValue | RGQLValue[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLValue.encode(p).finish()]
        }
      } else {
        yield* [RGQLValue.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLValue>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLValue> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLValue.decode(p)]
        }
      } else {
        yield* [RGQLValue.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLValue {
    return {
      queryNodeId: isSet(object.queryNodeId) ? Number(object.queryNodeId) : 0,
      arrayIndex: isSet(object.arrayIndex) ? Number(object.arrayIndex) : 0,
      posIdentifier: isSet(object.posIdentifier)
        ? Number(object.posIdentifier)
        : 0,
      value: isSet(object.value)
        ? RGQLPrimitive.fromJSON(object.value)
        : undefined,
      error: isSet(object.error) ? String(object.error) : '',
    }
  },

  toJSON(message: RGQLValue): unknown {
    const obj: any = {}
    message.queryNodeId !== undefined &&
      (obj.queryNodeId = Math.round(message.queryNodeId))
    message.arrayIndex !== undefined &&
      (obj.arrayIndex = Math.round(message.arrayIndex))
    message.posIdentifier !== undefined &&
      (obj.posIdentifier = Math.round(message.posIdentifier))
    message.value !== undefined &&
      (obj.value = message.value
        ? RGQLPrimitive.toJSON(message.value)
        : undefined)
    message.error !== undefined && (obj.error = message.error)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLValue>, I>>(
    object: I
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.resultId !== undefined && message.resultId !== 0) {
      writer.uint32(8).uint32(message.resultId)
    }
    if (message.values !== undefined && message.values.length !== 0) {
      for (const v of message.values) {
        writer.uint32(18).bytes(v!)
      }
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RGQLValueBatch {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRGQLValueBatch()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.resultId = reader.uint32()
          break
        case 2:
          message.values!.push(reader.bytes())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  // encodeTransform encodes a source of message objects.
  // Transform<RGQLValueBatch, Uint8Array>
  async *encodeTransform(
    source:
      | AsyncIterable<RGQLValueBatch | RGQLValueBatch[]>
      | Iterable<RGQLValueBatch | RGQLValueBatch[]>
  ): AsyncIterable<Uint8Array> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLValueBatch.encode(p).finish()]
        }
      } else {
        yield* [RGQLValueBatch.encode(pkt).finish()]
      }
    }
  },

  // decodeTransform decodes a source of encoded messages.
  // Transform<Uint8Array, RGQLValueBatch>
  async *decodeTransform(
    source:
      | AsyncIterable<Uint8Array | Uint8Array[]>
      | Iterable<Uint8Array | Uint8Array[]>
  ): AsyncIterable<RGQLValueBatch> {
    for await (const pkt of source) {
      if (Array.isArray(pkt)) {
        for (const p of pkt) {
          yield* [RGQLValueBatch.decode(p)]
        }
      } else {
        yield* [RGQLValueBatch.decode(pkt)]
      }
    }
  },

  fromJSON(object: any): RGQLValueBatch {
    return {
      resultId: isSet(object.resultId) ? Number(object.resultId) : 0,
      values: Array.isArray(object?.values)
        ? object.values.map((e: any) => bytesFromBase64(e))
        : [],
    }
  },

  toJSON(message: RGQLValueBatch): unknown {
    const obj: any = {}
    message.resultId !== undefined &&
      (obj.resultId = Math.round(message.resultId))
    if (message.values) {
      obj.values = message.values.map((e) =>
        base64FromBytes(e !== undefined ? e : new Uint8Array())
      )
    } else {
      obj.values = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RGQLValueBatch>, I>>(
    object: I
  ): RGQLValueBatch {
    const message = createBaseRGQLValueBatch()
    message.resultId = object.resultId ?? 0
    message.values = object.values?.map((e) => e) || []
    return message
  },
}

declare var self: any | undefined
declare var window: any | undefined
declare var global: any | undefined
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof self !== 'undefined') return self
  if (typeof window !== 'undefined') return window
  if (typeof global !== 'undefined') return global
  throw 'Unable to locate global object'
})()

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, 'base64').toString('binary'))
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i)
  }
  return arr
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, 'binary').toString('base64'))
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = []
  arr.forEach((byte) => {
    bin.push(String.fromCharCode(byte))
  })
  return btoa(bin.join(''))
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
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
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
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}