import { parse } from 'graphql';
import { ObservableQuery } from './query';
import { QueryTreeNode } from './query-tree';
import { ValueTreeNode } from './value-tree';
import { IChangeBus, ITreeMutation } from './query-tree/change-bus';
import { IRGQLValueMutation } from 'rgraphql';

import * as _ from 'lodash';

function mockAst() {
  return parse(
`query myQuery($age: Int) {
  allPeople(age: $age) {
    name
  }
}
`);
}

describe('ObservableQuery', () => {
  it('should build result values correctly', (done) => {
    let ast = mockAst();
    let qt = new QueryTreeNode();
    let changeBus: IChangeBus = {
      applyTreeMutation: (mutation: ITreeMutation) => {
        console.log('Applying:');
        console.log(mutation);
      },
    };
    qt.addChangeBus(changeBus);
    let vt = new ValueTreeNode(qt);
    let query = new ObservableQuery<any>(qt, vt, <any>ast.definitions[0], {age: 40});
    query.subscribe((value) => {
      let jsonValue = JSON.stringify(value);
      console.log(`Got value: ${jsonValue}`);
      let expectedVal =
        `{"data":{"allPeople":[{"name":"Jane"},{"name":"Bill"}]},"errors":[]}`;
      if (jsonValue === expectedVal) {
        done();
      }
    });
    // This will build:
    // {"allPeople":[{"name":"John"},{"name":"Jane"},{"name":"Bill"}]}
    // However, due to debouncing we won't see the entire thing on the output without delays.
    let mutations: IRGQLValueMutation[] = [
      {valueNodeId: 1, queryNodeId: 1},
      {valueNodeId: 4, parentValueNodeId: 1, queryNodeId: 1},
      {valueNodeId: 5, parentValueNodeId: 4, queryNodeId: 2, valueJson: '"John"', hasValue: true},
      {valueNodeId: 2, parentValueNodeId: 1, queryNodeId: 1},
      {valueNodeId: 6, parentValueNodeId: 2, queryNodeId: 2, valueJson: '"Jane"', hasValue: true},
      {valueNodeId: 3, parentValueNodeId: 1, queryNodeId: 1},
      {valueNodeId: 7, parentValueNodeId: 3, queryNodeId: 2, valueJson: '"Bill"', hasValue: true},
      {valueNodeId: 5, parentValueNodeId: 4, queryNodeId: 2, operation: 2},
      {valueNodeId: 4, parentValueNodeId: 1, queryNodeId: 1, operation: 2},
    ];
    for (let mut of mutations) {
      vt.applyValueMutation(mut);
    }
  });
});
