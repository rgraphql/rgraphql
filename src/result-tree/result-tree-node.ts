import { ResultTreeHandler } from './result-tree-handler'
import { rgraphql } from 'rgraphql'

export class ResultTreeNode {
  // children contains any children of this node
  public children: ResultTreeNode[] = []

  constructor(
    // value is the value of this node.
    public value: rgraphql.IRGQLValue
  ) {}

  // callHandler recursively calls handlers with the contents of the tree.
  // cb is called with each *rtNode and handler combo
  public callHandler(
    handler: ResultTreeHandler,
    cb: (rtn: ResultTreeNode, rth: ResultTreeHandler) => void
  ) {
    if (!handler) {
      return
    }
    for (let child of this.children) {
      let nextHandler = handler(child.value)
      if (nextHandler) {
        cb(child, nextHandler)
        child.callHandler(nextHandler, cb)
      }
    }
  }
}
