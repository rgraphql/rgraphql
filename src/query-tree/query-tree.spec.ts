import {
  QueryTreeNode,
} from './query-tree';
import {
  parse,
  print,
} from 'graphql';

function mockAst() {
  return parse(
`query myQuery {
  allPeople(age: 40) {
    name @live @defer
  }
  person {
    name
  }
}
query mySecondQuery {
  allPeople(age: 45) {
    description
  }
  person {
    age @live
  }
}
`);
}

describe('QueryTreeNode', () => {
  it('should build a tree properly', () => {
    let ast = mockAst();
    let tree = new QueryTreeNode();
    let querya = tree.buildQuery(<any>ast.definitions[0]);
    let queryb = tree.buildQuery(<any>ast.definitions[1]);
    expect(tree.children.length).toBe(3);
    let astb = tree.buildAst();
    let astStr = print(astb);
    console.log(astStr);
    /*
    expect(astStr).toEqual(`query rootQuery {
  allPeople(age: 40) {
    name @live @defer
  }
    `);
    */
  });
});
