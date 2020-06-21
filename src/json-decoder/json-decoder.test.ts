import { ResultTree } from '../result-tree/result-tree'
import { JSONDecoder } from './json-decoder'
import { QueryTree } from '../query-tree/query-tree'
import { parse, buildSchema, OperationDefinitionNode } from 'graphql'
import { rgraphql, PackPrimitive } from 'rgraphql'

describe('JSONDecoder', () => {
  let schema = buildSchema(`
        type RootQuery {
            person: Person
            people: [Person]
            image: Image
        }

        type Person {
            name: String
            height: Int
        }
        
        type Header {
            id: String
            url: String
            test: String
        }

        type Image {
            header: Header
        }

        schema {
            query: RootQuery
        }
        `)
  it('should decode a value stream properly', () => {
    let qt = new QueryTree(schema)
    let queryDefs = parse(`
        {
            person {
                name
            }
        }
        `)
    let query = qt.buildQuery(queryDefs.definitions[0] as OperationDefinitionNode)
    let decoder = new JSONDecoder(qt.getRoot(), query)
    let rtree = new ResultTree(qt, rgraphql.RGQLValueInit.CacheStrategy.CACHE_LRU, 50)
    rtree.addResultHandler(decoder.getResultHandler())

    rtree.handleValue({ queryNodeId: 1 })
    rtree.handleValue({
      queryNodeId: 2,
      posIdentifier: 1,
      value: { kind: rgraphql.RGQLPrimitive.Kind.PRIMITIVE_KIND_STRING, stringValue: 'test' }
    })
    rtree.handleValue({
      posIdentifier: 1,
      value: { kind: rgraphql.RGQLPrimitive.Kind.PRIMITIVE_KIND_STRING, stringValue: 'override' }
    })

    const result = decoder.getResult()
    expect(result).toEqual({ person: { name: 'override' } })
  })

  /*
    Emitted: []string{"QNode(1)"}
    Emitted: []string{"ArrayIDX(1)"}
    Emitted: []string{"QNode(3)", "Value(6)"}
    Emitted: []string{"QNode(1)"}
    Emitted: []string{"ArrayIDX(1)"}
    Emitted: []string{"QNode(2)", "Value(Joe)"}
  */
  it('should decode a complex value stream properly', () => {
    let qt = new QueryTree(schema)
    let queryDefs = parse(`
        {
            people {
                name
                height
            }
        }
        `)
    let query = qt.buildQuery(queryDefs.definitions[0] as OperationDefinitionNode)
    let decoder = new JSONDecoder(qt.getRoot(), query)
    let rtree = new ResultTree(qt, rgraphql.RGQLValueInit.CacheStrategy.CACHE_LRU, 50)
    rtree.addResultHandler(decoder.getResultHandler())

    rtree.handleValue({ queryNodeId: 1 })
    rtree.handleValue({ arrayIndex: 1 })
    rtree.handleValue({ queryNodeId: 3, value: PackPrimitive(6) })
    rtree.handleValue({ queryNodeId: 1 })
    rtree.handleValue({ arrayIndex: 1 })
    rtree.handleValue({ queryNodeId: 2, value: PackPrimitive('Joe') })

    expect(decoder.getResult()).toEqual({ people: [{ name: 'Joe', height: 6 }] })
  })
  it('should decode a field alias properly', () => {
    let qt = new QueryTree(schema)
    let queryDefs = parse(`
        {
            people {
                na: name
            }
        }
        `)
    let query = qt.buildQuery(queryDefs.definitions[0] as OperationDefinitionNode)
    let decoder = new JSONDecoder(qt.getRoot(), query)
    let rtree = new ResultTree(qt, rgraphql.RGQLValueInit.CacheStrategy.CACHE_LRU, 50)
    rtree.addResultHandler(decoder.getResultHandler())

    rtree.handleValue({ queryNodeId: 1 })
    rtree.handleValue({ arrayIndex: 1 })
    rtree.handleValue({ queryNodeId: 2, value: PackPrimitive('Joe') })

    expect(decoder.getResult()).toEqual({ people: [{ na: 'Joe' }] })
  })
  it('should decode a complex value properly', () => {
    let qt = new QueryTree(schema)
    let queryDefs = parse(`
        {
            image {
                header {
                    id
                    url
                    test
                }
            }
        }
        `)
    let query = qt.buildQuery(queryDefs.definitions[0] as OperationDefinitionNode)
    let decoder = new JSONDecoder(qt.getRoot(), query)
    let rtree = new ResultTree(qt, rgraphql.RGQLValueInit.CacheStrategy.CACHE_LRU, 50)
    rtree.addResultHandler(decoder.getResultHandler())

    rtree.handleValue({ queryNodeId: 1 })
    rtree.handleValue({ queryNodeId: 2, posIdentifier: 1 })
    rtree.handleValue({ queryNodeId: 3, value: PackPrimitive('myID') })
    rtree.handleValue({ posIdentifier: 1, queryNodeId: 4, value: PackPrimitive('MyURL') })
    rtree.handleValue({ posIdentifier: 1, queryNodeId: 5, value: PackPrimitive(4) })
    rtree.handleValue({ queryNodeId: 1 })
    rtree.handleValue({ queryNodeId: 2 })
    rtree.handleValue({ queryNodeId: 5, value: PackPrimitive(5) })

    expect(decoder.getResult()).toEqual({
      image: { header: { url: 'MyURL', id: 'myID', test: 5 } }
    })
  })
})
