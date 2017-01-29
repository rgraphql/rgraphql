import { QueryTreeNode } from './query-tree';
import { ValueTreeNode } from './value-tree';
import { IQuery } from './interfaces';

// Soyuz client.
export class SoyuzClient {
  private queryTree: QueryTreeNode;
  private valueTree: ValueTreeNode;

  constructor() {
    this.queryTree = new QueryTreeNode();
    this.valueTree = new ValueTreeNode(this.queryTree);
  }
}
