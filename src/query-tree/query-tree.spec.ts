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
    name @live
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

    querya.unsubscribe();
    // queryb.unsubscribe();

    tree.garbageCollect();
    // expect(tree.children.length).toBe(0);

    console.log(queryb);

    astb = tree.buildAst();
    astStr = print(astb);
    console.log('After unsubscribe:');
    console.log(astStr);
  });
  it('should build a result properly', () => {
    let ast = mockAst();
    let tree = new QueryTreeNode();
    let query = tree.buildQuery(<any>ast.definitions[0]);
    // let res = JSON.stringify(query.buildResult());
    // console.log(res);
  });
});
