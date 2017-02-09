import { SoyuzClient } from './client';
import { ITransport } from './transport';
import {
  IRGQLServerMessage,
  IRGQLClientMessage,
} from 'rgraphql';

class MockTransport implements ITransport {
  private messageHandler: (mes: IRGQLServerMessage) => void;

  public onMessage(cb: (mes: IRGQLServerMessage) => void) {
    this.messageHandler = cb;
  }

  public send(msg: IRGQLClientMessage) {
    console.log(`Sending: ${JSON.stringify(msg)}`);
  }
}

describe('SoyuzClient', () => {
  let client: SoyuzClient;

  beforeEach(() => {
    client = new SoyuzClient();
  });

  it('should add a transport properly', () => {
    let mt = new MockTransport();
    client.addTransport(mt);
  });
});
