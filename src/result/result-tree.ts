import { QueryTreeNode } from '../query-tree/query-tree';
import {
  IRGQLValue,
  IRGQLPrimitive,
  CacheStrategy,
  UnpackPrimitive,
} from 'rgraphql';
import { LRUMap } from 'lru_map';
import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';

// CursorPathElementKind represents if a path element is a qnode ID or array idx.
enum CursorPathElementKind {
  QUERY_NODE = 1,
  ARRAY_IDX = 2,
}

// ResultLocation stores a pointer to a location and a changed callback.
export type ResultLocation = [any, (id: number) => void];

// ResultTreeCursor handles pointing to a location in a result tree.
export class ResultTreeCursor {
  // Attached result locations.
  public resultLocations: { [id: number]: ResultLocation };
  // If we have an index in addition to the location, set here. 1-based.
  public arrayIndex: number;
  // If we have a query node ID in addition to the location, set here.
  public queryNodeId: number;
  // The query tree node.
  public queryNode: QueryTreeNode;
  // Path to this cursor, if not a value cursor.
  public path: number[];
  // outOfBounds if we no longer care about this value.
  public outOfBounds: boolean;

  // Copy duplicates the cursor.
  public copy(): ResultTreeCursor {
    let result = new ResultTreeCursor();
    result.arrayIndex = this.arrayIndex;
    result.queryNode = this.queryNode;
    result.queryNodeId = this.queryNodeId;
    result.outOfBounds = this.outOfBounds;
    result.resultLocations = {};
    for (let rid in this.resultLocations) {
      if (!this.resultLocations.hasOwnProperty(rid)) {
        continue;
      }
      result.resultLocations[+rid] = _.clone(this.resultLocations[rid]);
    }
    if (this.path) {
      result.path = this.path.slice();
    }
    return result;
  }

  // applyValueOnResult applies a value on one result.
  // note: pass undefined to delete the value at the position.
  public applyValueOnResult(unpk: any, qid: number) {
    let loc = this.resultLocations[qid + ''][0];
    if (this.arrayIndex) {
      if (unpk === undefined) {
        loc.splice(this.arrayIndex - 1, 1);
      } else {
        loc[this.arrayIndex - 1] = unpk;
      }
    } else {
      let qnk: any;
      if (qid === 0) {
        qnk = this.queryNodeId;
      } else {
        let qn = this.queryNode.root.rootNodeMap[this.queryNodeId];
        if (!qn) {
          this.outOfBounds = true;
          return;
        }
        qnk = qn.fieldNameForQuery(qid);
      }
      if (unpk === undefined) {
        delete loc[qnk];
      } else {
        loc[qnk] = unpk;
      }
    }
    // issue a changed notification
    this.resultLocations[qid + ''][1](qid);
  }

  // applyValue applies a primitive to all results.
  public applyValue(unpk: any) {
    for (let key in this.resultLocations) {
      if (!this.resultLocations.hasOwnProperty(key)) {
        continue;
      }
      let qid = +key;
      this.applyValueOnResult(unpk, qid);
    }
  }

  // Probe probes for an existing value at this location.
  public probe(): any {
    let loc = this.resultLocations[0][0];
    if (this.queryNodeId || this.arrayIndex) {
      return loc[this.queryNodeId || (this.arrayIndex - 1)];
    }
    return loc;
  }

  // Apply applies a value segment.
  public apply(segment: IRGQLValue) {
    if (this.outOfBounds) {
      return;
    }

    if (segment.queryNodeId || segment.arrayIndex) {
      if (!this.resolvePendingLocation(segment.queryNodeId, segment.arrayIndex)) {
        this.outOfBounds = true;
      }
    }

    if (segment.value) {
      this.applyValue(UnpackPrimitive(segment.value));
      segment.value = undefined; // clear in case we are used as a pos identifier.
    } else if (segment.error && segment.error.length) {
      this.applyValue({'$error': segment.error});
      segment.error = undefined;
    }
  }

  // addQuery checks if a query should be included in this cursor, and adds it if so.
  public addQuery(qid: number, result: any, resultCb: (id: number) => void) {
    // make sure we don't double register
    if (this.resultLocations.hasOwnProperty(qid + '')) {
      return;
    }

    // check if the qnode has this query
    if (!this.path || !this.queryNode || !this.queryNode.queries.hasOwnProperty(qid + '')) {
      return;
    }

    let qnr = this.queryNode.root;
    for (let element of this.path) {
      if (result instanceof Array) {
        result = result[element - 1];
      } else {
        let qn = qnr.rootNodeMap[element];
        if (!qn) {
          return;
        }
        let fieldName = qn.fieldNameForQuery(element);
        result = result[fieldName];
      }
    }
    this.resultLocations[qid] = [result, resultCb];
  }

  // removeQuery removes a query from the cursor.
  public removeQuery(qid: number) {
    delete this.resultLocations[qid];
  }

  // resolvePendingLocation updates location once we know if we have a array or object.
  public resolvePendingLocation(queryNodeId: number, arrayIndex: number, noNewData = false): boolean {
    // Detect if we're reaching a leaf array.
    let leafLoc: Array<any>;
    let isLeaf = this.queryNodeId && this.queryNode && !this.queryNode.children.length;
    if (isLeaf && arrayIndex) {
      leafLoc = [];
    }
    for (let locid in this.resultLocations) {
      if (!this.resultLocations.hasOwnProperty(locid)) {
        continue;
      }
      let queryId = +locid;
      let location = this.resultLocations[locid][0];
      if (!leafLoc && this.arrayIndex) {
        let eloc = location[this.arrayIndex - 1];
        if (eloc) {
          location = eloc;
        } else {
          if (noNewData) {
            delete this.resultLocations[locid];
            continue;
          }
          location = location[this.arrayIndex - 1] = queryNodeId ? {} : [];
        }
      } else if (this.queryNodeId) {
        let qn = this.queryNode.root.rootNodeMap[this.queryNodeId];
        if (!qn) {
          return false;
        }
        let fieldId = queryId === 0 ? this.queryNodeId : qn.fieldNameForQuery(queryId);
        let hasField = location.hasOwnProperty(fieldId);
        if (!hasField && noNewData) {
          delete this.resultLocations[locid];
          continue;
        }
        let nloc = leafLoc || (hasField ?
          location[fieldId] : (queryNodeId ? {} : []));
        location = location[fieldId] = nloc;
        this.queryNode = qn;
      }
      this.resultLocations[locid][0] = location;
    }
    if (leafLoc) {
      this.resultLocations = {0: this.resultLocations[0]};
      this.queryNode = undefined;
    }
    if (this.arrayIndex || this.queryNodeId) {
      this.path.push(this.arrayIndex || this.queryNodeId);
    }
    this.arrayIndex = arrayIndex;
    this.queryNodeId = queryNodeId;
    return true;
  }
}

// A CachedResultTreeCursor contains a tree cursor in the cache.
export class CachedResultTreeCursor {
  private _cursor: ResultTreeCursor;

  // Construct the result tree with the cursor.
  constructor(cursor: ResultTreeCursor) {
    this._cursor = cursor.copy();
  }

  // cursor returns the cached cursor.
  public cursor(): ResultTreeCursor {
    return this._cursor.copy();
  }

  // addQuery adds a query to the cached cursor.
  public addQuery(qid: number, result: Object, resultCb: (id: number) => void) {
    this._cursor.addQuery(qid, result, resultCb);
  }

  // removeQuery removes a query to the cached cursor.
  public removeQuery(qid: number) {
    this._cursor.removeQuery(qid);
  }
}

// ResultTree builds and manages results.
export class ResultTree {
  // result holds the result thus far.
  public result: Object = {};

  // cursor holds the current position selected by the segments processed so far.
  private cursor: ResultTreeCursor;
  // rootCursor is cloned to make a new cursor.
  private rootCursor: ResultTreeCursor;
  // LRU cache
  private cache: LRUMap<number, CachedResultTreeCursor>;
  // pendingPathComponent holds any previous unresolved path component.
  private pendingPathComponent: IRGQLValue;
  // query tree subscriptions to cleanup on dispose
  private queryTreeSubs: Subscription[];

  constructor(public id: number,
              public qtree: QueryTreeNode,
              public cacheStrategy: CacheStrategy,
              public cacheSize: number) {
    cacheStrategy = cacheStrategy || CacheStrategy.CACHE_LRU;
    if (cacheStrategy !== CacheStrategy.CACHE_LRU) {
      throw new Error('Cache strategy not supported.');
    }
    this.cache = new LRUMap<number, any>(cacheSize);

    this.queryTreeSubs = [];
    this.rootCursor = new ResultTreeCursor();
    this.rootCursor.resultLocations = {0: [this.result, (_) => {}]};
    this.rootCursor.path = [];
    this.rootCursor.queryNode = qtree;
    this.rootCursor.queryNodeId = 0;
    this.queryTreeSubs.push(qtree.rootDisposeSubject.subscribe((qn) => {
      this.purgeQueryNode(qn);
    }));
  }

  // addQuery registers a query by ID, returning the result object.
  public addQuery(id: number, changedCb: (id: number) => void): Object {
    let result: Object = {};
    this.rootCursor.resultLocations[id] = [result, changedCb];

    // DFS over the current result tree, apply to result.
    this.addQueryDFS(id, this.result, result);
    this.cache.forEach((value: CachedResultTreeCursor, key: number, _: any) => {
      value.addQuery(id, result, changedCb);
    });

    return result;
  }

  // removeQuery removes a query by ID.
  public removeQuery(id: number) {
    if (!this.rootCursor.resultLocations.hasOwnProperty(id + '')) {
      return;
    }
    delete this.rootCursor.resultLocations[id];
    this.cache.forEach((value: CachedResultTreeCursor, key: number, _: any) => {
      value.removeQuery(id);
    });
  }

  // purgeQueryNode removes a query node from the result tree.
  private purgeQueryNode(qnode: QueryTreeNode) {
    // rewind to the root
    let queryNodeIds: number[] = [];
    while (!qnode.isRoot) {
      queryNodeIds.push(qnode.id);
      qnode = qnode.parent;
    }

    // build a cursor
    let cursor = this.rootCursor.copy();
    // iterate over the qnodes.
    this.purgeQueryNodeDFS(queryNodeIds.length - 1, queryNodeIds, cursor);
  }

  // purgeQueryNodeDFS recursively traverses the query node list and removes data.
  private purgeQueryNodeDFS(pos: number, qnodes: number[], cursor: ResultTreeCursor) {
    if (pos === -1) {
      cursor.applyValue(undefined);
      return;
    }

    // probe instead
    let rloc = cursor.probe();
    if (rloc instanceof Array) {
      for (let i = 0; i < rloc.length; i++) {
        let nc = cursor.copy();
        nc.resolvePendingLocation(null, i + 1);
        this.purgeQueryNodeDFS(pos, qnodes, nc);
      }
    } else {
      let qnid = qnodes[pos];
      if (rloc.hasOwnProperty(qnid + '')) {
        let nc = cursor.copy();
        nc.resolvePendingLocation(qnid, null);
        this.purgeQueryNodeDFS(pos - 1, qnodes, nc);
      }
    }
  }

  // addQueryDFS recursively copies the result tree to the query result.
  private addQueryDFS(qid: number, srcLocation: any, targetLocation: any) {
    for (let qnids in srcLocation) {
      if (!srcLocation.hasOwnProperty(qnids)) {
        continue;
      }
      let qnid = +qnids;
      let qn = this.qtree.rootNodeMap[qnid];
      if (!qn) {
        continue;
      }
      if (!qn.queries[qid]) {
        continue;
      }
      let srcVal = srcLocation[qnids];
      let val: any = undefined;
      if (!qn.children || !qn.children.length) {
        val = srcVal;
      } else {
        // Recurse copy.
        // [[[{5: "test"}]]] -> copy recursively until we hit the object, then dfs
        if (srcVal instanceof Array) {
          this.addQueryArrDFS(qid, srcVal, val = []);
        } else {
          this.addQueryDFS(qid, srcVal, val = {});
        }
      }
      targetLocation[qn.fieldNameForQuery(qid)] = val;
    }
  }

  // srcLocation is source array, targetLocation is target array.
  private addQueryArrDFS(qid: number, srcLocation: Array<any>, targetLocation: Array<any>) {
    for (let i = 0; i < srcLocation.length; i++) {
      let srcVal: any = srcLocation[i];
      if (srcVal instanceof Array) {
        let tval: Array<any> = [];
        this.addQueryArrDFS(qid, srcVal, targetLocation[i] = tval);
      } else {
        this.addQueryDFS(qid, srcVal, targetLocation[i] = {});
      }
    }
  }

  // handleSegment handles an incoming path segment.
  public handleSegment(val: IRGQLValue) {
    // query_node_id=1
    //  - set this.cursor to root {}
    //  - add root[1]->?
    // array_index=1
    //  - root[1]->[]
    //  - root[1][0] = ?
    // query_node_id=4, pos_identifier=1
    //  - root[1][0] = {}
    //  - root[1][0][4] = ?
    //  - pos_identifier[1] -> root[1][0][4] (currently ?)
    // array_index=3, value="parent1"
    //  - root[1][0][4] = []
    //  - root[1][0][4][2] = "parent1"
    // result: {1: [{4: [-, -, "parent1"]}]}
    //               ^
    //               1
    //
    // note: all the (?) can be resolved in tuples.
    let isFirst = this.cursor === undefined;
    if (isFirst) {
      if (val.posIdentifier) {
        this.cursor = this.cache.get(val.posIdentifier).cursor();
        val.posIdentifier = 0;
      } else {
        this.cursor = this.rootCursor.copy();
      }
    }

    let hadValue = (!!val.value) || (!!val.error && !!val.error.length);
    this.cursor.apply(val);

    // Register any new position identifiers.
    if (!isFirst && val.posIdentifier) {
      this.cache.set(val.posIdentifier, new CachedResultTreeCursor(this.cursor));
    }

    // One we process a value, reset the state machine.
    if (hadValue) {
      this.cursor = undefined;
    }
  }

  public dispose() {
    for (let sub of this.queryTreeSubs) {
      sub.unsubscribe();
    }
    this.queryTreeSubs.length = 0;
  }
}
