import { SoyuzClient } from './client';
import { ITransport } from './transport';
import {
  IRGQLServerMessage,
  IRGQLClientMessage,
} from 'rgraphql';
import {
  parse,
} from 'graphql';

class MockTransport implements ITransport {
  public messageHandler: (mes: IRGQLServerMessage) => void;

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
    client.setTransport(mt);
  });
  fit('should execute a query properly', (done) => {
    let mt = new MockTransport();
    let sub = client.query<any>({
      query: parse(`
fragment PersonDetails on Person {
  name
}
query myQuery($age: Int) {
  allPeople(age: $age) {
    ...PersonDetails
  }
}`),
    });
    sub.subscribe((val) => {
      console.log(`Query returned value: ${JSON.stringify(val)}`);
      if (val.data && val.data.allPeople && val.data.allPeople.length) {
        done();
      }
    });
    console.log('Setting transport.');
    client.setTransport(mt);
    let msgs: IRGQLServerMessage[] = [
      {mutateValue: {valueNodeId: 1, queryNodeId: 1}},
      {mutateValue: {valueNodeId: 4, queryNodeId: 1, parentValueNodeId: 1}},
      {
        mutateValue: {
          valueNodeId: 5,
          parentValueNodeId: 4,
          queryNodeId: 2,
          valueJson: '"John"',
          hasValue: true,
        },
      },
    ];
    for (let msg of msgs) {
      mt.messageHandler(msg);
    }
  });
});
