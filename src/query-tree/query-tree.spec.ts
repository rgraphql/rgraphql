import {
  QueryTreeNode,
} from './query-tree';
import {
  parse,
  print,
} from 'graphql';
import {
  IRGQLQueryTreeNode,
} from 'rgraphql';
import {
  IChangeBus,
  ITreeMutation,
} from './change-bus';

function mockAst() {
  return parse(
`query myQuery {
  allPeople(age: 40) {
    name
  }
  person(distance: 5) {
    name
  }
}
query mySecondQuery($distance: Int) {
  allPeople(age: 40) {
    description
  }
  person(distance: $distance) {
    age
  }
}
`);
}

describe('QueryTreeNode', () => {
  it('should build a tree properly', () => {
    let ast = mockAst();
    let changeBus: IChangeBus = {
      applyTreeMutation: (mutation: ITreeMutation) => {
        console.log('Applying:');
        console.log(mutation);
      },
    };
    let tree = new QueryTreeNode();
    tree.addChangeBus(changeBus);

    let querya = tree.buildQuery(<any>ast.definitions[0], {});
    let queryb = tree.buildQuery(<any>ast.definitions[1], {distance: 10});
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
    let query = tree.buildQuery(<any>ast.definitions[0], {});

    // let res = JSON.stringify(query.buildResult());
    // console.log(res);
  });
  it('should build a proto tree properly', () => {
    let ast = mockAst();
    let tree = new QueryTreeNode();
    let query = tree.buildQuery(<any>ast.definitions[0], {});

    let res = tree.buildRGQLTree(true);
    expect(res).toEqual(<IRGQLQueryTreeNode>{
      id: 0,
      fieldName: '',
      directive: [],
      children: [{
        id: 1,
        fieldName: 'allPeople',
        directive: [],
        args: [{
          name: 'age',
          variableId: 0,
        }],
        children: [{
          id: 2,
          fieldName: 'name',
          directive: [],
          args: [],
          children: [],
        }],
      }, {
        id: 3,
        fieldName: 'person',
        directive: [],
        args: [{
          name: 'distance',
          variableId: 1,
        }],
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
  it('should build a plain full path properly', () => {
    let ast = mockAst();
    let tree = new QueryTreeNode();
    let query = tree.buildQuery(<any>ast.definitions[0], {});

    let res = tree.children[0].children[0].fullPathPlain;
    expect(res).toEqual(['allPeople', 'name']);
  });
});
