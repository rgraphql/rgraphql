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
import {
  IChangeBus,
} from './change-bus';

export interface IQueryTreeNode {
  root: IQueryTreeNode;
  parent?: IQueryTreeNode;
  children?: IQueryTreeNode[];
  rootNodeMap?: { [id: number]: IQueryTreeNode };
  changeBus?: IChangeBus[];

  buildRGQLTree(includeChildren?: boolean): IRGQLQueryTreeNode;
  resolveChild(path: ASTNode[]): IQueryTreeNode;
  removeQuery(query: IQuery): void;
  addChangeBus(changeBus: IChangeBus): void;
  garbageCollect(): boolean;
  propagateGcNext(): void;
  dispose(changeBusRemove?: boolean): void;
}

// Public query API.
export interface IQuery {
  ast: OperationDefinitionNode;

  // Kill the query / remove it from the tree.
  unsubscribe(): void;
}
