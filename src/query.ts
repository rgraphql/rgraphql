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
import { ResultTree } from './result';
import {
  OperationDefinitionNode,
  DocumentNode,
} from 'graphql';
import {
  binarySearch,
  insertionIndex,
} from './sort';

import * as _ from 'lodash';

// An error in the input query.
export type QueryError = QueryError;

// Result / ongoing status of a query.
export type QueryResult = {
  data: any;
  errors: any[];
};

// Options when starting a query.
export interface IQueryOptions {
  // The parsed query.
  query: DocumentNode;
  // Data to fill variables with.
  variables?: { [name: string]: any };
}

interface ISoyuzQueryContext {
  resultTree: ResultTree;
}

// An observable query.
export class ObservableQuery extends Observable<QueryResult> {
  // Any observers listening to this query's result.
  private observers: Observer<QueryResult>[];
  // AST
  private ast: OperationDefinitionNode;
  // Variables
  private variables: { [name: string]: any };
  // The current context behavior subject.
  private queryContext: BehaviorSubject<ISoyuzQueryContext>;
  // The query tree reference.
  private queryTree: QueryTreeNode;
  // The query in the query tree.
  private query: Query;
  // Any handles we should clear when dropping this.query.
  private querySubHandles: Subscription[];
  // Result data storage
  private lastResult: QueryResult;
  // Result tree
  private resultTree: ResultTree;
  // Result tree update subject
  private resultTreeSubj: BehaviorSubject<ResultTree>;

  private emitResult: Function;

  constructor(resultTreeSubj: BehaviorSubject<ResultTree>,
              queryTree: QueryTreeNode,
              ast: OperationDefinitionNode,
                variables: { [name: string]: any }) {
    // Initialize the Observable<T>
    const subscriberFn = (observer: Observer<QueryResult>) => {
      return this.onSubscribe(observer);
    };
    super(subscriberFn);

    this.queryTree = queryTree;
    this.queryContext = new BehaviorSubject<ISoyuzQueryContext>(null);
    this.ast = ast;
    this.variables = variables || {};
    this.observers = [];
    this.querySubHandles = [];
    this.resultTreeSubj = resultTreeSubj;
    this.lastResult = {
      data: <any>{},
      errors: [],
    };
    this.emitResult = _.debounce(() => {
      for (let obs of this.observers) {
        if (obs.next) {
          obs.next(this.lastResult);
        }
      }
    }, 10, {maxWait: 50, leading: false});
  }

  private onSubscribe(observer: Observer<QueryResult>) {
    this.observers.push(observer);

    if (this.observers.length === 1) {
      this.initQuery();
    } else {
      observer.next(this.lastResult);
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

  // Apply this query to the query tree and begin resolution.
  private initQuery() {
    if (this.query) {
      return;
    }

    // Note: this asserts OperationDefinition is a query.
    this.query = this.queryTree.buildQuery(this.ast, this.variables);
    this.querySubHandles.push(this.query.errors.subscribe((errArr) => {
      this.lastResult.errors = errArr;
      this.emitResult();
    }));

    this.querySubHandles.push(this.resultTreeSubj.subscribe((rt) => {
      this.setResultTree(rt);
    }));
  }

  private setResultTree(rt: ResultTree) {
    if (rt === this.resultTree) {
      return;
    }

    if (this.resultTree && this.query) {
      this.resultTree.removeQuery(this.query.id);
    }

    let hasObservers = this.observers.length;
    if (rt) {
      this.lastResult.data = rt.addQuery(this.query.id, (id: number) => {
        this.emitResult();
      });
    }
  }

  private cancelQuery() {
    if (this.query) {
      if (this.resultTree) {
        this.resultTree.removeQuery(this.query.id);
      }
      for (let hand of this.querySubHandles) {
        hand.unsubscribe();
      }
      this.querySubHandles.length = 0;
      this.query.unsubscribe();
      this.query = null;
    }
    if (this.queryContext.value) {
      this.queryContext.next(null);
    }
  }

  // Forcibly dispose the query and clear the observers.
  private dispose(reason?: any) {
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
