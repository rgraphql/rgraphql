import { parse, buildSchema, OperationDefinitionNode } from 'graphql'
import { QueryTree } from './query-tree.js'
import { QueryTreeHandler } from './query-tree-handler.js'
import { ResultTree } from './result-tree.js'
import { PackPrimitive } from '../primitive.js'
import {
  DeepPartial,
  RGQLQueryTreeMutation,
  RGQLValue,
  RGQLValueInit_CacheStrategy,
} from '../rgraphql.pb.js'

function mockSchema() {
  return buildSchema(`
  type RootQuery {
      person: Person
  }

  type Person {
    name: String
    age: Int
    description: String
  }

  schema {
    query: RootQuery
  }
  `)
}

function mockAst() {
  return parse(
    `query myQuery {
  person {
    name
  }
}
query mySecondQuery {
  person {
    description
  }
}
`,
  )
}

describe('QueryTreeNode', () => {
  it('should purge result tree nodes correctly', () => {
    const queryAst = mockAst()
    const handler: QueryTreeHandler = (mutation: RGQLQueryTreeMutation) => {
      console.log('Applying:')
      console.log(mutation)
    }
    const schema = mockSchema()
    const tree = new QueryTree(schema, handler)
    const rtree = new ResultTree(tree, RGQLValueInit_CacheStrategy.CACHE_LRU, 100)

    const querya = tree.buildQuery(queryAst.definitions[0] as OperationDefinitionNode, {})
    const queryb = tree.buildQuery(queryAst.definitions[1] as OperationDefinitionNode, {})
    // expect(tree.children.length).toBe(3)

    const vals: DeepPartial<RGQLValue>[] = [
      { queryNodeId: 1 },
      { queryNodeId: 2, value: PackPrimitive('test') },
      { queryNodeId: 1 },
      { queryNodeId: 3, value: PackPrimitive('descrip') },
    ]
    for (const val of vals) {
      rtree.handleValue(RGQLValue.create(val))
    }

    const rtRoot = rtree.getRoot()
    expect(rtRoot.children.length).toBe(1)
    expect(rtRoot.children[0].children.length).toBe(2)

    tree.detach(querya)
    expect(rtRoot.children[0].children.length).toBe(1)
    // expect(tree.children.length).toBe(0);
    console.log(queryb)
  })
})
