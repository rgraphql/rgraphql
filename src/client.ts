import { QueryTreeNode } from './query-tree';
import { ValueTreeNode } from './value-tree';
import { ITransport } from './transport';
import { ClientBus } from './client-bus';
import {
  ObservableQuery,
  IQueryOptions,
} from './query';
import { parse, OperationDefinitionNode } from 'graphql';
import { simplifyQueryAst } from './util/graphql';

// To make queries, we need a client and a transport.
export interface ISoyuzClientConnection {
  query<T>(options: IQueryOptions): ObservableQuery<T>;
  close(): void;
}

// Soyuz client.
export class SoyuzClient {
  private queryTree: QueryTreeNode;
  private transports: { [tid: number]: ITransport } = {};
  private valueTrees: { [tid: number]: ValueTreeNode } = {};
  private clientBusses: { [tid: number]: ClientBus } = {};
  private transportIdCounter: number = 0;

  constructor() {
    this.queryTree = new QueryTreeNode();
  }

  // addTransport adds a network connection / remote server to the client.
  public addTransport(transport: ITransport): ISoyuzClientConnection {
    let tid: number = this.transportIdCounter++;
    let vtr = new ValueTreeNode(this.queryTree);
    let clib = this.clientBusses[tid] = new ClientBus(transport, this.queryTree, vtr);
    this.valueTrees[tid] = vtr;
    this.transports[tid] = transport;
    this.queryTree.addChangeBus(clib);
    let self = this;
    return {
      query<T>(options: IQueryOptions) {
        return self.query<T>(vtr, options);
      },
      close() {
        self.deleteTransport(tid);
      },
    };
  }

  // removeTransport deletes a network connection and purges data from that remote.
  // It also cancels and closes all queries attached to the connection.
  public removeTransport(transport: ITransport) {
    for (let transportId in this.transports) {
      if (!this.transports.hasOwnProperty(transportId)) {
        continue;
      }
      if (this.transports[transportId] === transport) {
        this.deleteTransport(+transportId);
        break;
      }
    }
  }

  // Build a query against the system.
  // Note: call this on ISoyuzClientConnection instead (as a user).
  private query<T>(vt: ValueTreeNode, options: IQueryOptions): ObservableQuery<T> {
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
    return new ObservableQuery<T>(this.queryTree,
                                  vt,
                                  odef,
                                  options.variables);
  }

  // deleteTransport completely deletes a transport from the client.
  private deleteTransport(tid: number) {
    let vt = this.valueTrees[tid];
    if (vt) {
      vt.dispose();
    }
    delete this.transports[tid];
    delete this.valueTrees[tid];
    let cb = this.clientBusses[tid];
    if (cb) {
      this.queryTree.removeChangeBus(cb);
      cb.dispose();
      delete this.clientBusses[tid];
    }
  }
}
