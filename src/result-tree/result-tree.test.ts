import { ResultTree } from './result-tree'
import { QueryTree } from '../query-tree/query-tree'
import { QueryTreeHandler } from '../query-tree/query-tree-handler'
import { parse, buildSchema, OperationDefinitionNode } from 'graphql'
import { rgraphql, PackPrimitive } from 'rgraphql'

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
    let queryAst = mockAst()
    let handler: QueryTreeHandler = (mutation: rgraphql.IRGQLQueryTreeMutation) => {
      console.log('Applying:')
      console.log(mutation)
    }
    let schema = mockSchema()
    let tree = new QueryTree(schema, handler)
    let rtree = new ResultTree(tree, rgraphql.RGQLValueInit.CacheStrategy.CACHE_LRU, 100)

    let querya = tree.buildQuery(queryAst.definitions[0] as OperationDefinitionNode, {})
    let queryb = tree.buildQuery(queryAst.definitions[1] as OperationDefinitionNode, {})
    // expect(tree.children.length).toBe(3)

    let vals: rgraphql.IRGQLValue[] = [
      { queryNodeId: 1 },
      { queryNodeId: 2, value: PackPrimitive('test') },
      { queryNodeId: 1 },
      { queryNodeId: 3, value: PackPrimitive('descrip') }
    ]
    for (let val of vals) {
      rtree.handleValue(val)
    }

    let rtRoot = rtree.getRoot()
    expect(rtRoot.children.length).toBe(1)
    expect(rtRoot.children[0].children.length).toBe(2)

    tree.detach(querya)
    expect(rtRoot.children[0].children.length).toBe(1)
    // expect(tree.children.length).toBe(0);
    console.log(queryb)
  })
})
