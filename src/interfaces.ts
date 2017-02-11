import { ValueTreeNode } from './value-tree';
import { ITransport } from './transport';
import { ClientBus } from './client-bus';

export interface ISoyuzClientContext {
  valueTree: ValueTreeNode;
  transport: ITransport;
  clientBus: ClientBus;
}
