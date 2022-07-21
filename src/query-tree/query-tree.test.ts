import { QueryTree } from './query-tree'
import { QueryTreeHandler } from './query-tree-handler'
import { parse, buildSchema, OperationDefinitionNode } from 'graphql'
import * as rgraphql from 'rgraphql'

function mockSchema() {
  return buildSchema(`
  type RootQuery {
    allPeople(age: Int): [Person]
    person(distance: Int): Person
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
  allPeople {
    name
  }
  person(distance: 5) {
    name
  }
}
query mySecondQuery($distance: Int) {
  allPeople {
    description
  }
  person(distance: 5) {
    age
  }
}
`
  )
}

describe('QueryTreeNode', () => {
  it('should build a tree properly', () => {
    let queryAst = mockAst()
    let handler: QueryTreeHandler = (mutation: rgraphql.RGQLQueryTreeMutation) => {
      console.log('Applying:')
      console.log(mutation)
    }
    let schema = mockSchema()
    let tree = new QueryTree(schema, handler)

    let querya = tree.buildQuery(queryAst.definitions[0] as OperationDefinitionNode, {})
    let queryb = tree.buildQuery(queryAst.definitions[1] as OperationDefinitionNode, {
      distance: 10
    })
    // expect(tree.children.length).toBe(3)

    tree.detach(querya)
    // expect(tree.children.length).toBe(0);
    console.log(queryb)
  })

  it('should detect differing arguments', () => {
    let ast = parse(
      `
query myQuery {
  person(distance: 5) {
    name
  }
}
query mySecondQuery {
  person(distance: 50) {
    name
  }
}
`
    )
    let schema = mockSchema()
    let node = new QueryTree(schema)
    let sel1 = ast.definitions[0] as OperationDefinitionNode
    let sel2 = ast.definitions[1] as OperationDefinitionNode
    node.buildQuery(sel1, {})
    node.buildQuery(sel2, {})
    // expect(node.children.length).toBe(2)
  })

  it('should build a tree mutation stream', () => {
    let queryAst = mockAst()
    let muts: rgraphql.RGQLQueryTreeMutation[] = []
    let handler: QueryTreeHandler = (mutation: rgraphql.RGQLQueryTreeMutation) => {
      muts.push(mutation)
    }
    let schema = mockSchema()
    let tree = new QueryTree(schema, handler)

    let querya = tree.buildQuery(queryAst.definitions[0] as OperationDefinitionNode, {})
    console.log(JSON.stringify(muts, undefined, '  '))
    let queryb = tree.buildQuery(queryAst.definitions[1] as OperationDefinitionNode, {
      distance: 10
    })
    console.log(JSON.stringify(muts, undefined, '  '))
    // expect(tree.children.length).toBe(3)

    tree.detach(querya)
    // expect(tree.children.length).toBe(0);
    console.log(queryb)
    expect(muts.length).toBe(3)
  })
})
