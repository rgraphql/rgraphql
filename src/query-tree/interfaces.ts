import {
  ASTNode,
  OperationDefinitionNode,
} from 'graphql';
import {
  Observable,
} from 'rxjs/Observable';

export interface IQueryTreeNode {
  root: IQueryTreeNode;
  parent?: IQueryTreeNode;
  children?: IQueryTreeNode[];

  resolveChild(path: ASTNode[]): IQueryTreeNode;
}

// Public query API.
export interface IQuery {
  ast: OperationDefinitionNode;
}
