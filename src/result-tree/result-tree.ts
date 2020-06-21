import { PathCursor } from './path-cursor'
import { PathCache } from './path-cache'
import { QueryTree } from '../query-tree/query-tree'
import { ResultTreeNode } from './result-tree-node'
import { ResultTreeHandler } from './result-tree-handler'
import { Query } from '../query-tree/query'
import { rgraphql } from 'rgraphql'
import { QueryTreeNode } from '../query-tree/query-tree-node'
import { QueryNodePurgeHandler } from '../query-tree/query-tree-handler'

// IAttachedHandler is an attached query tree handler.
interface IAttachedHandler {
  handler: ResultTreeHandler
  cursors: PathCursor[]
  flush?: () => void
}

// IAttachedCursor is an attached result cursor.
interface IAttachedCursor {
  resultTreeNode: ResultTreeNode
  cursors: PathCursor[]
}

// ResultTree stores a RGQLValue result space.
// Subscribes to the "query node disposed" event stream.
// The minimum depth disposed node is emitted on that channel (only).
// ResultTree stores the []RGQLValue series.
export class ResultTree {
  private cursor: PathCursor | null = null
  private pathCache: PathCache
  private root: ResultTreeNode
  private rootCursor: PathCursor
  private handlers: IAttachedHandler[] = []
  private cachedCursors: IAttachedCursor[] = []
  private qtPurgeHandler: QueryNodePurgeHandler

  constructor(
    private qtree: QueryTree,
    cacheStrategy: rgraphql.RGQLValueInit.CacheStrategy,
    cacheSize: number
  ) {
    if (cacheStrategy !== rgraphql.RGQLValueInit.CacheStrategy.CACHE_LRU) {
      throw new Error('unsupported cache strategy: ' + cacheStrategy)
    }

    this.root = new ResultTreeNode({})
    this.rootCursor = new PathCursor(qtree.getRoot(), this.root)
    this.pathCache = new PathCache(cacheSize, this.handleCursorEvict.bind(this))
    this.qtPurgeHandler = this.handleQtNodePurge.bind(this)
    qtree.attachQtNodePurgeHandler(this.qtPurgeHandler)
  }

  // reset resets the result tree and state.
  public reset() {
    this.cachedCursors.length = 0
    this.handlers.length = 0
    this.root.children.length = 0
    this.rootCursor.resultHandlers.length = 0
    this.rootCursor.outOfBounds = false
    this.pathCache.reset()
    this.cursor = null
  }

  // detach detaches the handlers from the query tree.
  public detach() {
    this.qtree.detachQtNodePurgeHandler(this.qtPurgeHandler)
  }

  // getRoot returns the root node.
  public getRoot(): ResultTreeNode {
    return this.root
  }

  // handleValue handles an incoming value.
  // This must be called in-order.
  // If an error is thrown, behavior is then undefined.
  public handleValue(val: rgraphql.IRGQLValue) {
    let isFirst = !this.cursor
    if (isFirst) {
      let posID = val.posIdentifier
      if (posID) {
        let posIDCursor = this.pathCache.get(posID)
        if (!posIDCursor) {
          throw new Error('unknown position id referenced: ' + posID)
        }

        this.cursor = posIDCursor.clone()
        delete val.posIdentifier
        /*
        if (val.value) {
          this.cursor.apply({ value: val.value })
          this.cursor = null
        }
        */
        // return
      } else {
        this.cursor = this.rootCursor.clone()
      }
    }

    if (!this.cursor) {
      throw new Error('expected non-null cursor')
    }

    this.cursor.apply(val)
    let nPosID = val.posIdentifier
    if (nPosID) {
      this.pathCache.set(nPosID, this.cursor.clone())
    }
    if (val.value) {
      this.cursor = null
    }
  }

  // addResultHandler adds a result handler and calls it for all existing data that matches.
  public addResultHandler(handler: ResultTreeHandler, flush?: () => void) {
    this.handlers.push({ handler, cursors: [], flush })
    this.rootCursor.resultHandlers.push(handler)
    this.root.callHandler(handler, (rtn: ResultTreeNode, rth: ResultTreeHandler) => {
      let attachedCursors: PathCursor[] | undefined
      for (let cPair of this.cachedCursors) {
        if (cPair.resultTreeNode === rtn) {
          attachedCursors = cPair.cursors
          break
        }
      }

      if (!attachedCursors) {
        return
      }

      for (let hPair of this.handlers) {
        if (hPair.handler === rth) {
          hPair.cursors = hPair.cursors.concat(attachedCursors)
          for (let cursor of hPair.cursors) {
            cursor.resultHandlers.push(rth)
          }
          break
        }
      }
    })
    if (flush) {
      flush()
    }
  }

  // flushHandlers calls flush on each handler
  public flushHandlers() {
    for (let handler of this.handlers) {
      if (handler.flush) {
        handler.flush()
      }
    }
  }

  // removeResultHandler removes a result handler from the result tree.
  public removeResultHandler(handler: ResultTreeHandler) {
    let hPair: IAttachedHandler | undefined
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].handler === handler) {
        hPair = this.handlers[i]
        this.handlers[i] = this.handlers[this.handlers.length - 1]
        this.handlers.splice(this.handlers.length - 1, 1)
        break
      }
    }

    if (!hPair) {
      return
    }

    const rmFromResultHandlers = (rhs: ResultTreeHandler[]) => {
      for (let i = 0; i < rhs.length; i++) {
        if (rhs[i] === handler) {
          rhs[i] = rhs[rhs.length - 1]
          rhs.splice(rhs.length - 1, 1)
          break
        }
      }
    }

    for (let cursor of hPair.cursors) {
      rmFromResultHandlers(cursor.resultHandlers)
    }
    rmFromResultHandlers(this.rootCursor.resultHandlers)
  }

  // handleCursorEvict handles when a cursor is removed from the cache.
  private handleCursorEvict(cursor: PathCursor) {
    this.purgeCursor(cursor)
  }

  // handleQtNodePurge handles a node being purged from the query tree.
  private handleQtNodePurge(nod: QueryTreeNode | null) {
    // traverse to root
    // lock-step result tree
    // rtNode{root},
    //  - for child in children, if qnid == nodIds[i]
    //  - recursively purge
    let purgeQnIDs: number[] = []
    while (nod) {
      purgeQnIDs.push(nod.getID())
      nod = nod.getParent()
    }

    // purgeQnIDs = 5, 3, 2, 0
    let allHandlers: ResultTreeHandler[] = []
    for (let rth of this.handlers) {
      allHandlers.push(rth.handler)
    }
    this.purgeQtNodesRecursive(purgeQnIDs.length - 2, purgeQnIDs, this.root, allHandlers)
  }

  // purgeQtNodesRecursive purges any result tree nodes matching the qtnode selector.
  // furthermore, it informs the attached handlers.
  private purgeQtNodesRecursive(
    idx: number,
    purgeQnIDs: number[],
    rnode: ResultTreeNode,
    handlers: ResultTreeHandler[]
  ) {
    let qnid = purgeQnIDs[idx]
    let getNextHandlers = (rnode: ResultTreeNode): ResultTreeHandler[] => {
      let nh: ResultTreeHandler[] = []
      for (let handler of handlers) {
        if (!handler) continue
        let nnh = handler(rnode.value)
        if (nnh) {
          nh.push(nnh)
        }
      }
      return nh
    }
    for (let i = 0; i < rnode.children.length; i++) {
      let rchild = rnode.children[i]
      if (rchild.value.queryNodeId === qnid) {
        if (idx === 0) {
          delete rchild.value.value
          rnode.children[i] = rnode.children[rnode.children.length - 1]
          rnode.children.splice(rnode.children.length - 1, 1)
          i--
          for (let handler of handlers) {
            if (!handler) continue
            let nh = handler(rchild.value)
            if (nh) {
              nh(undefined)
            }
          }
        } else {
          this.purgeQtNodesRecursive(idx - 1, purgeQnIDs, rchild, getNextHandlers(rchild))
        }
      } else if (rchild.value.arrayIndex) {
        this.purgeQtNodesRecursive(idx, purgeQnIDs, rchild, getNextHandlers(rchild))
      }
    }
  }

  // purgeCursor purges the cursor from the rnode set
  private purgeCursor(cursor: PathCursor) {
    if (cursor.rnode) {
      // Purge the cursor from the rnode set.
      for (let i = 0; i < this.cachedCursors.length; i++) {
        let cachedCursor = this.cachedCursors[i]
        if (cachedCursor.resultTreeNode === cursor.rnode) {
          // remove cursor from the set
          for (let ci = 0; ci < cachedCursor.cursors.length; ci++) {
            if (cachedCursor.cursors[ci] === cursor) {
              cachedCursor.cursors[ci] = cachedCursor.cursors[cachedCursor.cursors.length - 1]
              cachedCursor.cursors.splice(cachedCursor.cursors.length - 1, 1)
              break
            }
          }
          if (cachedCursor.cursors.length === 0) {
            this.cachedCursors[i] = this.cachedCursors[this.cachedCursors.length - 1]
            this.cachedCursors.splice(this.cachedCursors.length - 1, 1)
          }
          break
        }
      }
    }

    for (let handler of cursor.resultHandlers) {
      for (let handlerPair of this.handlers) {
        if (handlerPair.handler === handler) {
          for (let ri = 0; ri < handlerPair.cursors.length; ri++) {
            if (handlerPair.cursors[ri] === cursor) {
              handlerPair.cursors[ri] = handlerPair.cursors[handlerPair.cursors.length - 1]
              handlerPair.cursors.splice(handlerPair.cursors.length - 1, 1)
              break
            }
          }
          break
        }
      }
    }
  }
}
