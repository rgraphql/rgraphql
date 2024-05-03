import { RGQLValue } from '../rgraphql.pb.js'
import { QueryTreeNode } from './query-tree-node.js'
import { ResultTreeHandler } from './result-tree-handler.js'
import { ResultTreeNode } from './result-tree-node.js'

// PathCursor selects a location in the result tree.
export class PathCursor {
  public resultHandlers: ResultTreeHandler[] = []
  public outOfBounds: boolean | undefined

  constructor(
    public qnode: QueryTreeNode,
    public rnode: ResultTreeNode,
  ) {}

  // apply applies a value to the cursor.
  public apply(val: RGQLValue) {
    if (this.outOfBounds) {
      return
    }

    let rtn: ResultTreeNode | undefined
    const isQnode = !!val.queryNodeId
    const isArray = !!val.arrayIndex
    const isValue = !!val.value
    if (isQnode) {
      const valQnID = val.queryNodeId || 0
      const nqn = this.qnode.lookupChildByID(valQnID)
      if (!nqn) {
        this.outOfBounds = true
        return
      }

      this.qnode = nqn
      for (const child of this.rnode.children) {
        if (child.value.queryNodeId === valQnID) {
          rtn = child
          break
        }
      }
    } else if (isArray) {
      // We expect query_node_id, then array_idx in two values
      // When we have query_node_id, the qnode is stepped, rnode stepped
      // Then when we have array_idx, qnode is left the same, rnode stepped.
      const valArrIdx = val.arrayIndex || 0
      // NOTE: this is slow, optimize in the future.
      for (const child of this.rnode.children) {
        if (child.value.arrayIndex === valArrIdx) {
          rtn = child
          break
        }
      }
    } else {
      rtn = this.rnode
    }

    if (!rtn) {
      rtn = new ResultTreeNode(val)
      this.rnode.children.push(rtn)
    } else if (isValue) {
      rtn.value = val
    }

    const nextHandlers: ResultTreeHandler[] = []
    for (const handler of this.resultHandlers) {
      if (!handler) {
        continue
      }
      const nextHandler = handler(val)
      if (nextHandler) {
        nextHandlers.push(nextHandler)
      }
    }
    this.resultHandlers = nextHandlers
    this.rnode = rtn
  }

  // clone clones the cursor and its values.
  public clone(): PathCursor {
    const n = new PathCursor(this.qnode, this.rnode)
    n.resultHandlers = this.resultHandlers.slice(0)
    if (this.outOfBounds) {
      n.outOfBounds = true
    }
    return n
  }
}
