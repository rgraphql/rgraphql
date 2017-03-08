import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISoyuzClientContext } from './interfaces';
import { ITransport } from './transport';
import {
  Query,
  QueryError,
} from './query-tree/query';
import { QueryTreeNode } from './query-tree/query-tree';
import {
  OperationDefinitionNode,
  DocumentNode,
} from 'graphql';
import {
  SerialOperationType,
  IRGQLSerialResponse,
  IRGQLQueryTreeNode,
  IASTVariable,
} from 'rgraphql';
import { Variable } from './var-store/var-store';

// An error in the input query.
export type MutationError = QueryError;

// Options when starting a mutation.
export interface IMutationOptions {
  // The parsed mutation.
  mutation: DocumentNode;
  // Data to fill variables with.
  variables?: { [name: string]: any };
}

interface ISoyuzMutationContext {
  transport: ITransport;
}

interface PromiseResolver<T> {
  promise?: Promise<T>;
  resolve?: (value: T) => void;
  reject?: (error?: any) => void;
}

function buildPromiseResolver<T>(): PromiseResolver<T> {
  let pr: PromiseResolver<T> = {};
  pr.promise = new Promise<T>((resolve, reject) => {
    let resolved = false;
    pr.resolve = (value: T) => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve(value);
    };
    pr.reject = (error?: any) => {
      if (resolved) {
        return;
      }
      resolved = true;
      reject(error);
    };
  });
  return pr;
}

// A mutation (promise pattern).
export class Mutation<T> {
  // Operation ID
  private operationId: number;
  // Promise resolver.
  private promiseResolver: PromiseResolver<T>;
  // AST
  private ast: OperationDefinitionNode;
  // Variables
  private variables: { [name: string]: any };
  // The query tree reference.
  private queryTree: QueryTreeNode;
  // The query in the query tree.
  private query: Query;
  // Any handles we should clear when dropping this.query.
  private querySubHandles: Subscription[];
  // Client context subject.
  private clientContext: BehaviorSubject<ISoyuzClientContext>;
  // Mutation context.
  private mutationContext: BehaviorSubject<ISoyuzMutationContext>;

  constructor(operationId: number,
              clientContext: BehaviorSubject<ISoyuzClientContext>,
              ast: OperationDefinitionNode,
                variables: { [name: string]: any }) {
    // Initialize the promise.
    this.promiseResolver = buildPromiseResolver<T>();
    this.mutationContext = new BehaviorSubject<ISoyuzMutationContext>(null);

    this.operationId = operationId;
    this.ast = ast;
    this.variables = variables || {};
    this.querySubHandles = [];
    this.clientContext = clientContext;
  }

  // Returns the promise for this mutation.
  public asPromise<T>(): Promise<T> {
    return <any>this.promiseResolver.promise;
  }

  // Apply this mutation to the transport and begin resolution.
  public init() {
    let queryRoot: IRGQLQueryTreeNode;
    let queryVariables: IASTVariable[] = [];
    this.queryTree = new QueryTreeNode();
    try {
      this.query = this.queryTree.buildQuery(this.ast, this.variables);
      queryRoot = this.queryTree.buildRGQLTree(true);
      this.queryTree.variableStore.forEach((vb: Variable) => {
        queryVariables.push(vb.toProto());
      });
    } catch (ex) {
      this.promiseResolver.reject(ex);
      return;
    }
    this.querySubHandles.push(this.clientContext.subscribe((ctx) => {
      let currentMutationContext = this.mutationContext.value;
      if (!ctx || !ctx.transport) {
        if (currentMutationContext) {
          this.mutationContext.next(null);
        }
        return;
      }
      if (currentMutationContext &&
            currentMutationContext.transport === ctx.transport) {
        return;
      }
      let nctx: ISoyuzMutationContext = {
        transport: ctx.transport,
      };
      this.mutationContext.next(nctx);
      ctx.transport.send({
        serialOperation: {
          operationId: this.operationId,
          operationType: SerialOperationType.MUTATION,
          variables: queryVariables,
          queryRoot,
        },
      });
    }));
  }

  // Handle the result for this mutation.
  public handleResult(result: IRGQLSerialResponse) {
    this.dispose();
    try {
      if (result.queryError &&
          result.queryError.errorJson &&
            result.queryError.errorJson.length) {
        this.promiseResolver.reject(
          JSON.parse(result.queryError.errorJson),
        );
        return;
      }
      if (result.resolveError &&
          result.resolveError.errorJson &&
            result.resolveError.errorJson.length) {
        this.promiseResolver.reject(
          JSON.parse(result.resolveError.errorJson),
        );
        return;
      }
      this.promiseResolver.resolve(
        JSON.parse(result.responseJson),
      );
    } catch (ex) {
      this.promiseResolver.reject(ex);
    }
  }

  public dispose() {
    for (let sub of this.querySubHandles) {
      sub.unsubscribe();
    }
    this.querySubHandles.length = 0;
  }
}
