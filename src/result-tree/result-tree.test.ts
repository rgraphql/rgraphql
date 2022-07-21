import { ResultTree } from './result-tree'
import { QueryTree } from '../query-tree/query-tree'
import { QueryTreeHandler } from '../query-tree/query-tree-handler'
import { parse, buildSchema, OperationDefinitionNode } from 'graphql'
import * as rgraphql from 'rgraphql'

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
`
  )
}

describe('QueryTreeNode', () => {
  it('should purge result tree nodes correctly', () => {
    const queryAst = mockAst()
    const handler: QueryTreeHandler = (mutation: rgraphql.RGQLQueryTreeMutation) => {
      console.log('Applying:')
      console.log(mutation)
    }
    const schema = mockSchema()
    const tree = new QueryTree(schema, handler)
    const rtree = new ResultTree(tree, rgraphql.RGQLValueInit_CacheStrategy.CACHE_LRU, 100)

    const querya = tree.buildQuery(queryAst.definitions[0] as OperationDefinitionNode, {})
    const queryb = tree.buildQuery(queryAst.definitions[1] as OperationDefinitionNode, {})
    // expect(tree.children.length).toBe(3)

    const vals: rgraphql.RGQLValue[] = [
      { queryNodeId: 1 },
      { queryNodeId: 2, value: rgraphql.PackPrimitive('test') },
      { queryNodeId: 1 },
      { queryNodeId: 3, value: rgraphql.PackPrimitive('descrip') },
    ]
    for (const val of vals) {
      rtree.handleValue(val)
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
