import { RGQLQueryTreeMutation } from '../rgraphql.pb.js'
import { QueryTreeNode } from './query-tree-node.js'

// QueryTreeHandler handles changes to the query tree.
export type QueryTreeHandler = (mut: RGQLQueryTreeMutation) => void

// QueryTreePurgeHandler handles query nodes being purged from the query tree.
export type QueryNodePurgeHandler = (qnode: QueryTreeNode) => void
