import {
  IQuery,
  IQueryTreeNode,
} from './interfaces';
import {
  OperationDefinitionNode,
} from 'graphql';

// Represent a query as a subscription.
export class Query implements IQuery {
  public nodes: IQueryTreeNode[] = [];

  constructor(public ast: OperationDefinitionNode) {
  }
}
