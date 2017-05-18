export interface IRGQLQueryFieldDirective {
  name?: string;
  args?: IFieldArgument[];
}

export interface IRGQLQueryTreeNode {
  id?: number;
  fieldName?: string;
  args?: IFieldArgument[];
  directive?: IRGQLQueryFieldDirective[];
  children?: IRGQLQueryTreeNode[];
}

export interface IFieldArgument {
  name?: string;
  variableId?: number;
}

export interface IASTVariable {
  id?: number;
  value?: IRGQLPrimitive;
}

export interface IRGQLPrimitive {
  kind?: Kind;
  intValue?: number;
  floatValue?: number;
  stringValue?: string;
  binaryValue?: Buffer;
  boolValue?: boolean;
}

export const enum Kind {
  PRIMITIVE_KIND_NULL = 0,
  PRIMITIVE_KIND_INT = 1,
  PRIMITIVE_KIND_FLOAT = 2,
  PRIMITIVE_KIND_STRING = 3,
  PRIMITIVE_KIND_BOOL = 4,
  PRIMITIVE_KIND_BINARY = 5,
  PRIMITIVE_KIND_OBJECT = 6,
  PRIMITIVE_KIND_ARRAY = 7,
}

export interface IRGQLClientMessage {
  initQuery?: IRGQLQueryInit;
  mutateTree?: IRGQLQueryTreeMutation;
  finishQuery?: IRGQLQueryFinish;
}

export interface IRGQLQueryInit {
  queryId?: number;
  forceSerial?: boolean;
  operationType?: string;
}

export interface IRGQLQueryTreeMutation {
  queryId?: number;
  nodeMutation?: INodeMutation[];
  variables?: IASTVariable[];
}

export interface INodeMutation {
  nodeId?: number;
  operation?: SubtreeOperation;
  node?: IRGQLQueryTreeNode;
}

export const enum SubtreeOperation {
  SUBTREE_ADD_CHILD = 0,
  SUBTREE_DELETE = 1,
}

export interface IRGQLQueryFinish {
  queryId?: number;
}

export interface IRGQLServerMessage {
  queryError?: IRGQLQueryError;
  valueInit?: IRGQLValueInit;
  valueBatch?: IRGQLValueBatch;
  valueFinalize?: IRGQLValueFinalize;
}

export interface IRGQLValueInit {
  resultId?: number;
  queryId?: number;
  cacheStrategy?: CacheStrategy;
  cacheSize?: number;
}

export const enum CacheStrategy {
  CACHE_LRU = 0,
}

export interface IRGQLValueFinalize {
  resultId?: number;
}

export interface IRGQLQueryError {
  queryId?: number;
  queryNodeId?: number;
  error?: string;
}

export interface IRGQLValue {
  queryNodeId?: number;
  arrayIndex?: number;
  posIdentifier?: number;
  value?: IRGQLPrimitive;
  error?: string;
}

export interface IRGQLValueBatch {
  resultId?: number;
  values?: Buffer[];
}


