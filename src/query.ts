import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  Query,
  QueryError,
} from './query-tree/query';
import { QueryTreeNode } from './query-tree/query-tree';
import { ValueTreeNode } from './value-tree';
import {
  OperationDefinitionNode,
  DocumentNode,
} from 'graphql';

import * as _ from 'lodash';

// An error in the input query.
export type QueryError = QueryError;

// Result / ongoing status of a query.
export type QueryResult<T> = {
  data: T;
  errors: QueryError[];
};

// Options when starting a query.
export interface IQueryOptions {
  // The parsed query.
  query: DocumentNode;
  // Data to fill variables with.
  variables?: { [name: string]: any };
}

// An observable query.
export class ObservableQuery<T> extends Observable<QueryResult<T>> {
  // Any observers listening to this query's result.
  private observers: Observer<QueryResult<T>>[];
  // The underlying query-tree query handle.
  private query: Query;
  // Any handles we should clear when dropping query.
  private querySubHandles: Subscription[];
  // Result data storage
  private lastResult: QueryResult<T>;
  // Emit to cancel value tree
  private vtCancel: BehaviorSubject<boolean>;
  // Query tree
  private queryTree: QueryTreeNode;
  // Value tree
  private valueTree: ValueTreeNode;
  // AST
  private ast: OperationDefinitionNode;
  // Variables
  private variables: { [name: string]: any };
  // Disposed
  private disposed: boolean;

  constructor(queryTree: QueryTreeNode,
              valueTree: ValueTreeNode,
              ast: OperationDefinitionNode,
                variables: { [name: string]: any }) {
    // Initialize the Observable<T>
    const subscriberFn = (observer: Observer<QueryResult<T>>) => {
      return this.onSubscribe(observer);
    };
    super(subscriberFn);

    this.disposed = false;
    this.queryTree = queryTree;
    this.valueTree = valueTree;
    this.ast = ast;
    this.variables = variables || {};
    this.observers = [];
    this.querySubHandles = [];
    this.lastResult = {
      data: <any>{},
      errors: [],
    };
    this.vtCancel = new BehaviorSubject<boolean>(false);

    setTimeout(() => {
      this.queryTree.error.subscribe(null, null, () => {
        this.forceDispose('The query tree is being disposed.');
      });
      this.valueTree.value.subscribe(null, null, () => {
        this.forceDispose('The value tree is being disposed.');
      });
    }, 0);
  }

  private onSubscribe(observer: Observer<QueryResult<T>>) {
    if (this.disposed) {
      if (observer.error) {
        observer.error('Query is disposed, cannot subscribe.');
      } else if (observer.complete) {
        observer.complete();
      }
      return;
    }

    this.observers.push(observer);

    if (observer.next) {
      observer.next(this.lastResult);
    }

    if (this.observers.length === 1) {
      this.initQuery();
    }

    return {
      unsubscribe: () => {
        let idx = this.observers.indexOf(observer);
        if (idx === -1) {
          return;
        }

        this.observers.splice(idx, 1);
        if (this.observers.length === 0) {
          this.cancelQuery();
        }
      },
    };
  }

  // Actually start the query once someone subscribes.
  private initQuery() {
    this.vtCancel.next(false);
    // Note: this asserts OperationDefinition is a query.
    // Check this before constructing the ObservableQuery object.
    this.query = this.queryTree.buildQuery(this.ast, this.variables);
    this.querySubHandles.push(this.query.errors.subscribe((errArr) => {
      this.lastResult.errors = errArr;
      this.emitResult();
    }));
    let noEmit = false;
    let vtsub = this.vtCancel.subscribe((usub) => {
      if (!usub) {
        return;
      }
      noEmit = true;
      vtsub.unsubscribe();
    });
    this.hookValueTree().subscribe(_.debounce((val: any) => {
      if (noEmit) {
        return;
      }
      this.emitResult();
    }, 10, {maxWait: 100}));
  }

  /*
    allPeople: 1 // Container for the array. depth=0, hasChildren=true
      0: 1 // each index gets a node. depth = 1, hasChildren=true
        - name: 2 // field gets a node. depth=0, hasChildren=false
      1: 3
        - name: 4
      2: 5
        - name: 6
  */

  // Traverse the value tree and register new hooks.
  private hookValueTree(vtree: ValueTreeNode = this.valueTree,
                        parentVal: any = this.lastResult.data,
                        parentIdxMarker: any[] = [],
                        qnodeDepth: number = 0): Subject<void> {
    if (this.vtCancel.value) {
      return;
    }

    let changed = new Subject<void>();
    let subHandles: Subscription[] = [];
    let cleanupFuncs: (() => void)[] = [];
    let qnode = vtree.queryNode;
    let cleanup = () => {
      for (let sh of subHandles) {
        sh.unsubscribe();
      }
      subHandles.length = 0;
      for (let cu of cleanupFuncs) {
        cu();
      }
    };
    let reevaluate = () => {
      cleanup();
      let hvt = this.hookValueTree(vtree, parentVal, parentIdxMarker, qnodeDepth);
      if (hvt) {
        hvt.subscribe(() => {
          changed.next();
        });
      }
    };
    subHandles.push(this.vtCancel.subscribe((doCancel) => {
      if (doCancel) {
        cleanup();
      }
    }));

    // If we're not interested in this query node, subscribe in case we become interested.
    if (!qnode.queries[this.query.id]) {
      let shand = qnode.queryAdded.subscribe((query: Query) => {
        if (query === this.query) {
          reevaluate();
        }
      });
      subHandles.push(shand);
      return null;
    }

    // Handle what happens if we remove this query (lose interest).
    subHandles.push(qnode.queryRemoved.subscribe((query: Query) => {
      if (query === this.query) {
        reevaluate();
      }
    }));

    let hasChildren: boolean = !!qnode.children.length;
    let hasValue: boolean = qnodeDepth === 0 && !hasChildren;
    let fieldName = qnode.queriesAlias[this.query.id] || qnode.fieldName;

    // console.log(`Qtree (${qnode.id})[${fieldName}] \
// -> hasChildren: ${hasChildren}, hasValue: ${hasValue}`);

    let pv: any;
    let pvChildIdxMarker: any[];
    let pvIdxMarker: any = {};
    let valueCh: Subject<any> = new Subject<any>();
    if (!hasValue) {
      if (qnode.id === 0) {
        pv = parentVal;
      } else if (qnodeDepth === 0) {
        pv = [];
        pvChildIdxMarker = [];
        parentVal[fieldName] = pv;
        cleanupFuncs.push(() => {
          if (!parentVal.hasOwnProperty(fieldName)) {
            return;
          }
          delete parentVal[fieldName];
          changed.next();
        });
      } else {
        pv = {};
        parentVal.push(pv);
        parentIdxMarker.push(pvIdxMarker);
        cleanupFuncs.push(() => {
          let idx = parentIdxMarker.indexOf(pvIdxMarker);
          if (idx === -1) {
            return;
          }
          parentVal.splice(idx, 1);
          parentIdxMarker.splice(idx, 1);
          changed.next();
        });
        subHandles.push(valueCh.subscribe((val) => {
          if (!val && !hasValue) {
            return;
          }
          hasValue = true;
          let idx = parentIdxMarker.indexOf(pvIdxMarker);
          if (idx === -1) {
            return;
          }
          parentVal[idx] = val;
          changed.next();
        }));
      }
    } else {
      subHandles.push(valueCh.subscribe((val) => {
        parentVal[fieldName] = val;
        changed.next();
      }));
      cleanupFuncs.push(() => {
        if (!parentVal.hasOwnProperty(fieldName)) {
          return;
        }
        delete parentVal[fieldName];
        changed.next();
      });
    }

    let addChild = (child: ValueTreeNode) => {
      let cqnode = child.queryNode;
      let ndepth = 0;
      if (cqnode === qnode) {
        ndepth = qnodeDepth + 1;
      }
      let childSubj = this.hookValueTree(child, pv, pvChildIdxMarker, ndepth);
      if (childSubj) {
        childSubj.subscribe(() => {
          changed.next();
        });
      }
    };

    for (let child of vtree.children) {
      addChild(child);
    }
    vtree.childAdded.subscribe((vchild: ValueTreeNode) => {
      addChild(vchild);
    });

    subHandles.push(vtree.value.subscribe((val) => {
      // console.log(`Vtree ${vtree.id} emitted value: ${JSON.stringify(val)}`);
      valueCh.next(val);
    }, null, () => {
      cleanup();
    }));

    return changed;
  }

  private cancelQuery() {
    if (this.query) {
      for (let hand of this.querySubHandles) {
        hand.unsubscribe();
      }
      this.querySubHandles.length = 0;
      this.query.unsubscribe();
      this.query = null;
    }
    this.vtCancel.next(true);
  }

  private emitResult() {
    for (let obs of this.observers) {
      if (obs.next) {
        obs.next(this.lastResult);
      }
    }
  }

  // Forcibly dispose the query and clear the observers.
  private forceDispose(reason?: any) {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.cancelQuery();
    for (let obs of this.observers) {
      if (reason && obs.error) {
        obs.error(reason);
      } else if (obs.complete) {
        obs.complete();
      }
    }
    this.observers.length = 0;
  }
}
