import {
  parse,
} from 'graphql';
import {
  Kind,
  CacheStrategy,
  IRGQLValue,
} from 'rgraphql';
import {
  ResultTree,
  ResultTreeCursor,
  CachedResultTreeCursor,
} from './result-tree';
import {
  QueryTreeNode,
} from '../query-tree/query-tree';
import {
  Query,
} from '../query-tree/query';

function parseQuery(query: string): any {
  return parse(`query { ${query} }`).definitions[0];
}

describe('ResultTreeCursor', () => {
  it('should handle a root-level object value', () => {
    let root = {};
    let cursor = new ResultTreeCursor();
    cursor.path = [];
    cursor.resultLocations = {0: [root, (id) => {}]};
    cursor.queryNode = new QueryTreeNode();
    cursor.queryNode.buildQuery(parseQuery(`people { age }`), {});
    cursor.apply({queryNodeId: 1});
    cursor.apply({queryNodeId: 2, value: {intValue: 1, kind: Kind.PRIMITIVE_KIND_INT}});
    expect(root).toEqual({1: {2: 1}});
  });
  it('should handle a root-level primitive array', () => {
    let root = {};
    let cursor = new ResultTreeCursor();
    cursor.path = [];
    cursor.queryNode = new QueryTreeNode();
    cursor.queryNode.buildQuery(parseQuery(`distances`), {});
    cursor.resultLocations = {0: [root, (id) => {}]};
    cursor.apply({queryNodeId: 1});
    cursor.apply({arrayIndex: 1, value: {intValue: 1, kind: Kind.PRIMITIVE_KIND_INT}});
    expect(root).toEqual({1: [1]});
  });
  it('should handle a basic object array, with checkpointing', () => {
    let root = {};
    let cursor = new ResultTreeCursor();
    cursor.path = [];
    cursor.queryNode = new QueryTreeNode();
    cursor.queryNode.buildQuery(parseQuery(`people { name, age }`), {});
    cursor.resultLocations = {0: [root, (id) => {}]};
    cursor.apply({queryNodeId: 1});
    cursor.apply({arrayIndex: 1}); // checkpoint here.

    let cache = new CachedResultTreeCursor(cursor);
    cursor.apply({queryNodeId: 2, value: {stringValue: 'test', kind: Kind.PRIMITIVE_KIND_STRING}});
    expect(root).toEqual({1: [{2: 'test'}]});

    cursor = cache.cursor();
    cursor.apply({queryNodeId: 3, value: {kind: Kind.PRIMITIVE_KIND_NULL}});
    expect(root).toEqual({1: [{2: 'test', 3: null}]});
  });
  it('should handle aliasing a live value', () => {
    let root = {};
    let cursor = new ResultTreeCursor();
    cursor.path = [];
    cursor.queryNode = new QueryTreeNode();
    cursor.queryNode.buildQuery(parseQuery(`ages`), {});
    cursor.resultLocations = {0: [root, (id) => {}]};
    cursor.apply({queryNodeId: 1});
    cursor.apply({arrayIndex: 1, value: {kind: Kind.PRIMITIVE_KIND_INT, intValue: 5}});
    let cache = new CachedResultTreeCursor(cursor);
    expect(root).toEqual({1: [5]});

    cursor = cache.cursor();
    cursor.apply({posIdentifier: 1, value: {stringValue: 'test', kind: Kind.PRIMITIVE_KIND_STRING}});
    expect(root).toEqual({1: ['test']});
  });
});

describe('ResultTree', () => {
  it('should handle a complex object', (done) => {
    let qt = new QueryTreeNode();
    let q: Query = qt.buildQuery(parseQuery(`allPeople { name, age, parents, favoriteMonths }`), {});
    let rt = new ResultTree(0, qt, CacheStrategy.CACHE_LRU, 2);
    let qres = rt.addQuery(q.id, (id) => {});
    let segments: IRGQLValue[] = [
      {queryNodeId: 1},
      {arrayIndex: 1, posIdentifier: 1},
      {queryNodeId: 2, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Jane'}},
      {queryNodeId: 5, posIdentifier: 1},
      {arrayIndex: 2, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'March'}},
      {queryNodeId: 3, posIdentifier: 1, value: {kind: Kind.PRIMITIVE_KIND_INT, intValue: 5}},
      {queryNodeId: 5, posIdentifier: 1},
      {arrayIndex: 1, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'January'}},
      {queryNodeId: 5, posIdentifier: 1},
      {arrayIndex: 4, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'December'}},
      {queryNodeId: 5, posIdentifier: 1},
      {arrayIndex: 3, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'August'}},
      {queryNodeId: 4, posIdentifier: 1},
      {arrayIndex: 3, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Parent3'}},
      {queryNodeId: 4, posIdentifier: 1},
      {arrayIndex: 1, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Parent1'}},
      {queryNodeId: 4, posIdentifier: 1},
      {arrayIndex: 2, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Parent2'}},
    ];

    for (let seg of segments) {
      rt.handleSegment(seg);
    }

    expect(rt.result).toEqual({
      1: [{
        2: 'Jane',
        3: 5,
        4: ['Parent1', 'Parent2', 'Parent3'],
        5: ['January', 'March', 'August', 'December'],
      }],
    });
    expect(qres).toEqual({
      'allPeople': [{
        'name': 'Jane',
        'age': 5,
        'parents': ['Parent1', 'Parent2', 'Parent3'],
        'favoriteMonths': ['January', 'March', 'August', 'December'],
      }],
    });

    // Attempt to build a second query to read the cache.
    let qorig = q;
    q = qt.buildQuery(<any>parse(`
query {
  allPeople {
    parents
  }
}
                        `).definitions[0], {});
    qres = rt.addQuery(q.id, (id) => {});
    expect(qres).toEqual({
      'allPeople': [{
        'parents': ['Parent1', 'Parent2', 'Parent3'],
      }],
    });

    rt.handleSegment({queryNodeId: 4, posIdentifier: 1});
    rt.handleSegment({arrayIndex: 4, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Parent4'}});

    expect(qres).toEqual({
      'allPeople': [{
        'parents': ['Parent1', 'Parent2', 'Parent3', 'Parent4'],
      }],
    });

    // Remove the original query
    qorig.unsubscribe();

    // Force immediate gc
    qt.garbageCollect();

    // Make sure the data was removed from the tree
    setTimeout(() => {
      expect(rt.result).toEqual({
        1: [{
          4: ['Parent1', 'Parent2', 'Parent3', 'Parent4'],
        }],
      });
      done();
    }, 300);
  });
});
