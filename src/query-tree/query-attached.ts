import { Query } from './query'
import { QueryTreeNode } from './query-tree-node'

// AttachedQuery tracks internal information about a query attached to a tree.
export class AttachedQuery {
  // qtNodes are the query tree nodes referenced by this query.
  public qtNodes: QueryTreeNode[] = []

  constructor(
    // query is the underlying query
    public query: Query
  ) {}

  // appendQueryNode appends a query tree node to the attached query.
  public appendQueryNode(qtNode: QueryTreeNode) {
    this.qtNodes.push(qtNode)
  }
}
