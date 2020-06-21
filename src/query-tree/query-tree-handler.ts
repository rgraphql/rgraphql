import { rgraphql } from 'rgraphql'
import { QueryTreeNode } from './query-tree-node'

// QueryTreeHandler handles changes to the query tree.
export type QueryTreeHandler = (mut: rgraphql.IRGQLQueryTreeMutation) => void

// QueryTreePurgeHandler handles query nodes being purged from the query tree.
export type QueryNodePurgeHandler = (qnode: QueryTreeNode) => void
