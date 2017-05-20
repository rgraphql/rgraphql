import { SoyuzClient } from './client';
import { ITransport } from './transport';
import {
  IRGQLServerMessage,
  IRGQLClientMessage,
  CacheStrategy,
  IRGQLValue,
  RGQLValue,
  Kind,
} from 'rgraphql';
import {
  parse,
} from 'graphql';

class MockTransport implements ITransport {
  public messageHandler: (mes: IRGQLServerMessage) => void;
  private queryIdCtr = 1;

  public onMessage(cb: (mes: IRGQLServerMessage) => void) {
    this.messageHandler = cb;
  }

  public send(msg: IRGQLClientMessage) {
    console.log(`Sending: ${JSON.stringify(msg)}`);
  }

  public nextQueryId(): number {
    return this.queryIdCtr++;
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
  it('should execute a query properly', (done) => {
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
      variables: {
        age: 20,
      },
    });
    sub.subscribe((val) => {
      console.log(`Query returned value: ${JSON.stringify(val)}`);
      if (val.data && val.data.allPeople && val.data.allPeople.length && val.data.allPeople[0].name === 'Test') {
        done();
      }
    });
    console.log('Setting transport.');
    client.setTransport(mt);
    let batchValues: IRGQLValue[] = [
      {queryNodeId: 1},
      {arrayIndex: 1},
      {queryNodeId: 2, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Test'}},
    ];
    let encValues: Uint8Array[] = [];
    for (let v of batchValues) {
      encValues.push(RGQLValue.encode(v).finish());
    }
    let msgs: IRGQLServerMessage[] = [
      {valueInit: {queryId: 1, resultId: 1, cacheSize: 200, cacheStrategy: CacheStrategy.CACHE_LRU}},
      {valueBatch: {resultId: 1, values: encValues}},
      {valueFinalize: {resultId: 1}},
    ];
    for (let msg of msgs) {
      mt.messageHandler(msg);
    }
  });
});
