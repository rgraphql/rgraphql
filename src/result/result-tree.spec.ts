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

describe('ResultTreeCursor', () => {
  it('should handle a root-level object value', () => {
    let root = {};
    let cursor = new ResultTreeCursor();
    cursor.path = [];
    cursor.resultLocations = {0: [root, (id) => {}]};
    cursor.apply({queryNodeId: 1});
    cursor.apply({queryNodeId: 2, value: {intValue: 1, kind: Kind.PRIMITIVE_KIND_INT}});
    expect(root).toEqual({1: {2: 1}});
  });
  it('should handle a root-level primitive array', () => {
    let root = {};
    let cursor = new ResultTreeCursor();
    cursor.path = [];
    cursor.resultLocations = {0: [root, (id) => {}]};
    cursor.apply({queryNodeId: 1});
    cursor.apply({arrayIndex: 1, value: {intValue: 1, kind: Kind.PRIMITIVE_KIND_INT}});
    expect(root).toEqual({1: [1]});
  });
  it('should handle a basic object array, with checkpointing', () => {
    let root = {};
    let cursor = new ResultTreeCursor();
    cursor.path = [];
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
  it('should handle a complex object', () => {
    let qt = new QueryTreeNode();
    let q: Query = qt.buildQuery(<any>parse(`
query {
  allPeople {
    name
    age
    parents
  }
}
                        `).definitions[0], {});
    let rt = new ResultTree(0, qt, CacheStrategy.CACHE_LRU, 2);
    let qres = rt.addQuery(q.id, (id) => {});
    let segments: IRGQLValue[] = [
      {queryNodeId: 1},
      {arrayIndex: 1},
      {queryNodeId: 4, posIdentifier: 1},
      {arrayIndex: 3, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Parent3'}},
      {posIdentifier: 1, arrayIndex: 1, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Parent1'}},
      {posIdentifier: 1, arrayIndex: 2, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Parent2'}},
      {queryNodeId: 1},
      {arrayIndex: 1},
      {queryNodeId: 3, value: {kind: Kind.PRIMITIVE_KIND_INT, intValue: 5}},
      {queryNodeId: 1},
      {arrayIndex: 1},
      {queryNodeId: 2, value: {kind: Kind.PRIMITIVE_KIND_STRING, stringValue: 'Jane'}},
    ];

    for (let seg of segments) {
      rt.handleSegment(seg);
    }

    expect(rt.result).toEqual({
      1: [{
        2: 'Jane',
        3: 5,
        4: ['Parent1', 'Parent2', 'Parent3'],
      }],
    });
    expect(qres).toEqual({
      'allPeople': [{
        'name': 'Jane',
        'age': 5,
        'parents': ['Parent1', 'Parent2', 'Parent3'],
      }],
    });

    // Attempt to build a second query to read the cache.
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
  });
});
