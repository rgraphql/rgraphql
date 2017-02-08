import { QueryTreeNode } from './query-tree';
import { ValueTreeNode } from './value-tree';
import { ITransport } from './transport';
import { ClientBus } from './client-bus';

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
  public addTransport(transport: ITransport) {
    let tid: number = this.transportIdCounter++;
    let vtr = new ValueTreeNode(this.queryTree);
    let clib = this.clientBusses[tid] = new ClientBus(transport, this.queryTree, vtr);
    this.valueTrees[tid] = vtr;
    this.transports[tid] = transport;
    this.queryTree.addChangeBus(clib);
  }

  // removeTransport deletes a network connection and purges data from that remote.
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

  // deleteTransport completely deletes a transport from the client.
  private deleteTransport(tid: number) {
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
