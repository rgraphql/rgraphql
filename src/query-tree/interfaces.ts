import {
  ASTNode,
  OperationDefinitionNode,
} from 'graphql';
import {
  Observable,
} from 'rxjs/Observable';
import {
  IRGQLQueryTreeNode,
} from 'rgraphql';

export interface IQueryTreeNode {
  root: IQueryTreeNode;
  parent?: IQueryTreeNode;
  children?: IQueryTreeNode[];
  rootNodeMap?: { [id: number]: IQueryTreeNode };

  buildRGQLTree(includeChildren?: boolean): IRGQLQueryTreeNode;
  resolveChild(path: ASTNode[]): IQueryTreeNode;
  removeQuery(query: IQuery): void;
  garbageCollect(): boolean;
  propagateGcNext(): void;
  dispose(): void;
}

// Public query API.
export interface IQuery {
  ast: OperationDefinitionNode;

  // Kill the query / remove it from the tree.
  unsubscribe(): void;
}
