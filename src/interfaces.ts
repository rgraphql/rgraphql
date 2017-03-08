import { ValueTreeNode } from './value-tree';
import { ITransport } from './transport';
import { ClientBus } from './client-bus';
import { IRGQLSerialResponse } from 'rgraphql';

// Client context, including transport and bus.
export interface ISoyuzClientContext {
  valueTree: ValueTreeNode;
  transport: ITransport;
  clientBus: ClientBus;
}

// General interface for a serial operation handler.
export interface ISoyuzSerialOperation {
  init(): void;
  asPromise<T>(): Promise<T>;
  handleResult(result: IRGQLSerialResponse): void;
}
