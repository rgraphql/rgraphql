import {
  QueryTreeNode,
} from './query-tree';
import {
  parse,
  print,
} from 'graphql';
import {
  IRGQLQueryTreeNode,
  ASTValueKind,
} from 'rgraphql';

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
query mySecondQuery($age: Int) {
  allPeople(age: 5) {
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
  it('should build a proto tree properly', () => {
    let ast = mockAst();
    let tree = new QueryTreeNode();
    let query = tree.buildQuery(<any>ast.definitions[0]);

    let res = tree.buildRGQLTree(true);
    expect(res).toEqual(<IRGQLQueryTreeNode>{
      id: 0,
      fieldName: null,
      directive: [],
      children: [{
        id: 1,
        fieldName: 'allPeople',
        directive: [],
        args: [{
          name: 'age',
          value: {
            kind: 3,
            intValue: 40,
          },
        }],
        children: [{
          id: 2,
          fieldName: 'name',
          directive: [{
            name: 'live',
            args: [],
          }],
          args: [],
          children: [],
        }],
      }, {
        id: 3,
        fieldName: 'person',
        directive: [],
        args: [],
        children: [{
          id: 4,
          fieldName: 'name',
          directive: [],
          args: [],
          children: [],
        }],
      }],
    });
  });
});
