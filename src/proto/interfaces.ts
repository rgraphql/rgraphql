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
  jsonValue?: string;
}

export interface IRGQLClientMessage {
  mutateTree?: IRGQLTreeMutation;
  serialOperation?: IRGQLSerialOperation;
}

export interface IRGQLTreeMutation {
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

export interface IRGQLSerialOperation {
  operationId?: number;
  operationType?: SerialOperationType;
  variables?: IASTVariable[];
  queryRoot?: IRGQLQueryTreeNode;
}

export const enum SerialOperationType {
  MUTATION = 0,
}

export interface IRGQLServerMessage {
  mutateValue?: IRGQLValueMutation;
  queryError?: IRGQLQueryError;
  serialResponse?: IRGQLSerialResponse;
}

export interface IRGQLSerialResponse {
  operationId?: number;
  responseJson?: string;
  error?: IRGQLQueryError;
}

export interface IRGQLQueryError {
  queryNodeId?: number;
  errorJson?: string;
}

export interface IRGQLValueMutation {
  valueNodeId?: number;
  parentValueNodeId?: number;
  queryNodeId?: number;
  operation?: ValueOperation;
  valueJson?: string;
  hasValue?: boolean;
  isArray?: boolean;
}

export const enum ValueOperation {
  VALUE_SET = 0,
  VALUE_ERROR = 1,
  VALUE_DELETE = 2,
}


