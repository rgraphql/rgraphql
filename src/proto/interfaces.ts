export interface IRGQLQueryFieldDirective {
  kind?: EDirectiveKind;
  argsJson?: string;
}

export const enum EDirectiveKind {
  DIRECTIVE_NONE = 0,
  DIRECTIVE_LIVE = 1,
}

export interface IRGQLQueryTreeNode {
  id?: number;
  fieldName?: string;
  argsJson?: string;
  directive?: IRGQLQueryFieldDirective[];
  children?: IRGQLQueryTreeNode[];
}


