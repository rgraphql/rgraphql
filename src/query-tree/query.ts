import {
  OperationDefinitionNode,
  visit,
} from 'graphql';

export interface IQueryRemoveable {
  removeQuery(query: Query): void;
}

// Represent a query as a subscription.
export class Query {
  public nodes: IQueryRemoveable[] = [];

  private subscribed = true;

  constructor(public ast: OperationDefinitionNode,
              private root: IQueryRemoveable) {
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
