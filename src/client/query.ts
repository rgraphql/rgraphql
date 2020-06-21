import { Query } from '../query-tree/query'
import { ResultTreeHandler } from '../result-tree/result-tree-handler'
import { ResultTree } from '../result-tree/result-tree'

// IResultHandler handles results.
export interface IResultHandler {
  // flush flushes any pending value callbacks.
  // this indicates the end of the message batch.
  flush(): void
  // getResultHandler returns a result tree handler.
  getResultHandler(): ResultTreeHandler
}

// RunningQuery is a reference to a running query.
export class RunningQuery {
  // handlers are the result tree handlers attached to this query.
  private handlers: IResultHandler[] = []
  // rootRtHandlers are the result tree handlers corresponding to handlers at the same index.
  private rootRtHandlers: ResultTreeHandler[] = []

  constructor(
    // query is the underlying query
    private query: Query,
    // resultTree is the result tree
    private resultTree: ResultTree,
    // disposeCb is the dispose callback
    private disposeCb: (() => void) | null
  ) {
    if (!this.disposeCb) {
      this.disposeCb = (() => {
        /* */
      }).bind(this)
    }
  }

  // getQuery returns the underlying query
  public getQuery(): Query {
    return this.query
  }

  // attachHandler attaches a handler to the query.
  public attachHandler(handler: IResultHandler) {
    if (!this.disposeCb) {
      throw new Error('cannot attach handler to disposed query')
    }

    for (let hh of this.handlers) {
      if (hh === handler) {
        return
      }
    }
    let rhandler = handler.getResultHandler()
    this.handlers.push(handler)
    this.rootRtHandlers.push(rhandler)
    this.resultTree.addResultHandler(rhandler, handler.flush.bind(handler))
  }

  // detachHandler detaches a handler from the query.
  public detachHandler(handler: IResultHandler) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i] === handler) {
        this.resultTree.removeResultHandler(this.rootRtHandlers[i])
        this.handlers.splice(i, 1)
        this.rootRtHandlers.splice(i, 1)
        break
      }
    }
  }

  // dispose cancels the query and detaches it from the tree.
  public dispose() {
    if (!this.disposeCb) {
      return
    }
    for (let i = 0; i < this.handlers.length; i++) {
      this.resultTree.removeResultHandler(this.rootRtHandlers[i])
    }
    this.handlers.length = 0
    this.rootRtHandlers.length = 0
    this.disposeCb()
    this.disposeCb = null
  }
}
