import { ResultTreeHandler } from '../result-tree/result-tree-handler'
import { QueryTreeNode } from '../query-tree/query-tree-node'
import { JSONDecoderHandler } from './json-decoder-handler'
import { Query } from '../query-tree/query'
import { RunningQuery } from '../client/query'

// JSONDecoder is a result handler that decodes the query to JSON.
export class JSONDecoder {
  // result is the result object.
  private result: any = {}
  // dirty indicates the value is dirty
  private dirty = false

  // qnode_id -> array_idx => parent[qnode_field_name] = []
  // qnode_id -> array_idx -> primitive => parent[qnode_field_name][array_idx-1] = primitive

  // qnode_id -> primitive => parent[qnode_field_name] = primitive

  // qnode_id -> array_idx -> qnode_id = parent[qnode_field_name][array_idx-1] = {qnode_field_name: ?}
  // qnode_id goes to pending

  constructor(
    // qnode is the root of the query tree
    private qnode: QueryTreeNode,
    // query is the running query reference
    private query: Query,
    // resultCb is called when the result changes.
    // note: this callback may be called many times.
    private resultCb?: (val: any) => void
  ) {}

  // getResult returns the active result value.
  public getResult(): any {
    return this.result
  }

  // flush flushes any pending change callbacks
  public flush() {
    /*
    if (!this.dirty) {
      return
    }
    */

    this.dirty = false
    if (this.resultCb) {
      this.resultCb(this.result)
    }
  }

  // getResultHandler returns the result tree handler function.
  public getResultHandler(): ResultTreeHandler {
    let qmap = this.query.getQueryMap() || undefined
    let handler = new JSONDecoderHandler(qmap, () => {
      this.dirty = true
    })
    handler.qnode = this.qnode
    handler.value = this.result
    return handler.handleValue.bind(handler)
  }
}
