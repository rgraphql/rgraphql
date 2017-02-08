import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import {
  Query,
  QueryError,
} from './query-tree/query';
import { ValueTreeNode } from './value-tree';
import { OperationDefinitionNode } from 'graphql';

// An error in the input query.
export type QueryError = QueryError;

// Result / ongoing status of a query.
export type QueryResult<T> = {
  data: T;
  errors: QueryError[];
};

// An observable query.
export class ObservableQuery<T> extends Observable<QueryResult<T>> {
  // Any observers listening to this query's result.
  private observers: Observer<QueryResult<T>>[];
  // The underlying query-tree query handle.
  private query: Query;
  // Any handles we should clear when dropping query.
  private querySubHandles: Subscription[] = [];
  // Cached result data.
  private lastResult: QueryResult<T> = {data: null, errors: []};

  constructor(private queryTree: QueryTreeNode,
              private valueTree: ValueTreeNode,
              private ast: OperationDefinitionNode,
                private variables: { [name: string]: any }) {
    // Initialize the Observable<T>
    const subscriberFn = (observer: Observer<QueryResult<T>>) => {
      return this.onSubscribe(observer);
    };
    super(subscriberFn);
  }

  private onSubscribe(observer: Observer<QueryResult<T>>) {
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
    // Note: this asserts OperationDefinition is a query.
    // Check this before constructing the ObservableQuery object.
    this.query = this.queryTree.buildQuery(this.ast, this.variables);
    this.querySubHandles.push(this.query.errors.subscribe((errArr) => {
      this.lastResult = {
        data: this.lastResult.data,
        errors: errorArr,
      };
      this.emitResult();
    }));
    this.initValueTree();
  }

  // Traverse the value tree and register new hooks.
  private initValueTree(valueNode: ValueTreeNode) {
    //
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
  }

  private emitResult() {
    for (let obs of this.observers) {
      if (obs.next) {
        obs.next(this.lastResult);
      }
    }
  }
}
