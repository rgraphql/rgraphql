import { QueryTreeNode } from './query-tree';
import { ResultTree } from './result';
import { ITransport } from './transport';
import { RunningQuery } from './running-query';
import {
  ObservableQuery,
  IQueryOptions,
} from './query';
import {
  IMutationOptions,
} from './mutation';
import { parse, OperationDefinitionNode } from 'graphql';
import { simplifyQueryAst } from './util/graphql';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

// Soyuz client.
export class SoyuzClient {
  // queryTree holds the global live query tree.
  private queryTree: QueryTreeNode = new QueryTreeNode();
  private transportIdCounter = 0;
  private transport: ITransport;
  private queries: { [id: number]: RunningQuery } = {};
  private primaryQueryId: number;
  private primaryResultTree: BehaviorSubject<ResultTree> = new BehaviorSubject<ResultTree>(null);
  private transportSubs: Subscription[] = [];

  // Set transport causes the client to start using a new transport to talk to the server.
  // Pass null to stop using the previous transport.
  public setTransport(transport: ITransport) {
    if (this.transport === transport) {
      return;
    }

    if (this.transport) {
      for (let queryId in this.queries) {
        if (!this.queries.hasOwnProperty(queryId)) {
          continue;
        }
        this.queries[queryId].dispose();
      }
      this.queries = {};
      for (let sub of this.transportSubs) {
        sub.unsubscribe();
      }
      this.transportSubs.length = 0;
    }

    if (!transport) {
      return;
    }

    let tid: number = this.transportIdCounter++;
    // start the initial root query
    let query = new RunningQuery(transport, this.queryTree, 'query');
    this.transportSubs.push(query.resultTree.subscribe((tree) => {
      this.primaryResultTree.next(tree);
    }));
    this.primaryQueryId = query.id;
    this.queries = {};
    this.queries[query.id] = query;
    query.resultTree.subscribe({complete: () => {
      if (this.queries[query.id] === query) {
        delete this.queries[query.id];
      }
    }});
  }

  // Build a query against the system.
  public query<T>(options: IQueryOptions): ObservableQuery {
    if (!options || !options.query) {
      throw new Error('You must specify a options object and query.');
    }
    let nast = simplifyQueryAst(options.query);
    let odef: OperationDefinitionNode;
    for (let def of nast.definitions) {
      if (def.kind === 'OperationDefinition') {
        odef = def;
      }
    }
    if (!odef) {
      throw new Error('Your provided query document did not contain a query definition.');
    }
    return new ObservableQuery(this.primaryResultTree, this.queryTree, odef, options.variables);
  }

  // Execute a mutation against the system.
  public mutate<T>(options: IMutationOptions): Promise<T> {
    if (!options || !options.mutation) {
      throw new Error('You must specify a options object and mutation document.');
    }
    let nast = simplifyQueryAst(options.mutation);
    let odef: OperationDefinitionNode;
    for (let def of nast.definitions) {
      if (def.kind === 'OperationDefinition') {
        odef = def;
      }
    }
    if (!odef) {
      throw new Error('Your provided mutation document did not contain a mutation definition.');
    }
    // start the query.
    let qt = new QueryTreeNode();
    let qr = new RunningQuery(this.transport, qt, 'mutation');
    let uqr = qt.buildQuery(odef, options.variables || {});
    this.queries[qr.id] = qr;
    let lrt: any;
    let data: any;
    let rtsub = qr.resultTree.subscribe((rt) => {
      if (!rt || rt === lrt) {
        return;
      }
      lrt = rt;
      data = rt.addQuery(uqr.id, (id) => {});
    });
    return new Promise<T>((reject, resolve) => {
      qr.resultTree.subscribe({
        error: (err) => {
          reject(err);
        },
        complete: () => {
          resolve(data);
        },
      });
    });
  }
}
