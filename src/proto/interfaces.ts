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
  value?: IASTValue;
}

export interface IASTValue {
  stringValue?: string;
  listValue?: IASTValue[];
  intValue?: number;
  floatValue?: number;
  boolValue?: boolean;
  objectFields?: IASTObjectField[];
  kind?: ASTValueKind;
}

export const enum ASTValueKind {
  AST_VALUE_NULL = 0,
  AST_VALUE_STRING = 1,
  AST_VALUE_ENUM = 2,
  AST_VALUE_INT = 3,
  AST_VALUE_FLOAT = 4,
  AST_VALUE_BOOL = 5,
  AST_VALUE_LIST = 6,
  AST_VALUE_OBJECT = 7,
}

export interface IASTObjectField {
  key?: string;
  value?: IASTValue;
}

export interface IRGQLClientMessage {
  mutateTree?: IRGQLTreeMutation;
  mutateField?: IRGQLFieldMutation;
}

export interface IRGQLTreeMutation {
  nodeId?: number;
  operation?: SubtreeOperation;
  node?: IRGQLQueryTreeNode;
}

export const enum SubtreeOperation {
  SUBTREE_ADD_CHILD = 0,
  SUBTREE_DELETE = 1,
}

export interface IRGQLFieldMutation {
  nodeId?: number;
}

export interface IRGQLServerMessage {
  mutateValue?: IRGQLValueMutation;
}

export interface IRGQLValueMutation {
  valueNodeId?: number;
  parentValueNodeId?: number;
  queryNodeId?: number;
  operation?: ValueOperation;
  valueJson?: string;
}

export const enum ValueOperation {
  VALUE_SET = 0,
  VALUE_ERROR = 1,
  VALUE_DELETE = 2,
}


