import { QueryTreeNode } from '../query-tree/query-tree-node'
import { ResultTreeNode } from './result-tree-node'
import { ResultTreeHandler } from './result-tree-handler'
import { rgraphql } from 'rgraphql'

// PathCursor selects a location in the result tree.
export class PathCursor {
  public resultHandlers: ResultTreeHandler[] = []
  public outOfBounds: boolean | undefined

  constructor(public qnode: QueryTreeNode, public rnode: ResultTreeNode) {}

  // apply applies a value to the cursor.
  public apply(val: rgraphql.IRGQLValue) {
    if (this.outOfBounds) {
      return
    }

    let rtn: ResultTreeNode | undefined
    let isQnode = !!val.queryNodeId
    let isArray = !!val.arrayIndex
    let isValue = !!val.value
    if (isQnode) {
      let valQnID = val.queryNodeId || 0
      let nqn = this.qnode.lookupChildByID(valQnID)
      if (!nqn) {
        this.outOfBounds = true
        return
      }

      this.qnode = nqn
      for (let child of this.rnode.children) {
        if (child.value.queryNodeId === valQnID) {
          rtn = child
          break
        }
      }
    } else if (isArray) {
      // We expect query_node_id, then array_idx in two values
      // When we have query_node_id, the qnode is stepped, rnode stepped
      // Then when we have array_idx, qnode is left the same, rnode stepped.
      let valArrIdx = val.arrayIndex || 0
      // NOTE: this is slow, optimize in the future.
      for (let child of this.rnode.children) {
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

    let nextHandlers: ResultTreeHandler[] = []
    for (let handler of this.resultHandlers) {
      if (!handler) {
        continue
      }
      let nextHandler = handler(val)
      if (nextHandler) {
        nextHandlers.push(nextHandler)
      }
    }
    this.resultHandlers = nextHandlers
    this.rnode = rtn
  }

  // clone clones the cursor and its values.
  public clone(): PathCursor {
    let n = new PathCursor(this.qnode, this.rnode)
    n.resultHandlers = this.resultHandlers.slice(0)
    if (this.outOfBounds) {
      n.outOfBounds = true
    }
    return n
  }
}
