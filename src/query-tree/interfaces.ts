import { OperationDefinitionNode } from 'graphql';

export interface IQueryTreeNode {
  root: IQueryTreeNode;
  parent?: IQueryTreeNode;
  children?: IQueryTreeNode[];
}

// Public query API.
export interface IQuery {
  ast: OperationDefinitionNode;
}
