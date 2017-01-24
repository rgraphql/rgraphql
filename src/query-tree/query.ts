import {
  IQuery,
  IQueryTreeNode,
} from './interfaces';
import {
  OperationDefinitionNode,
  visit,
} from 'graphql';

// Represent a query as a subscription.
export class Query implements IQuery {
  public nodes: IQueryTreeNode[] = [];

  private subscribed = true;

  constructor(public ast: OperationDefinitionNode,
              public root: IQueryTreeNode) {
  }

  public unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    this.subscribed = false;

    for (let nod of this.nodes) {
      nod.removeQuery(this);
    }
    this.nodes.length = 0;
  }
}
