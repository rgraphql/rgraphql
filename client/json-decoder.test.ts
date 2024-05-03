import { describe, it, expect } from 'vitest'
import { parse, buildSchema, OperationDefinitionNode } from 'graphql'
import { QueryTree } from './query-tree.js'
import { JSONDecoder } from './json-decoder.js'
import { ResultTree } from './result-tree.js'
import { RGQLPrimitive_Kind, RGQLValue, RGQLValueInit_CacheStrategy } from '../rgraphql.pb.js'
import { PackPrimitive } from '../primitive.js'

describe('JSONDecoder', () => {
  const schema = buildSchema(`
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
    const qt = new QueryTree(schema)
    const queryDefs = parse(`
        {
            person {
                name
            }
        }
        `)
    const query = qt.buildQuery(queryDefs.definitions[0] as OperationDefinitionNode)
    const decoder = new JSONDecoder(qt.getRoot(), query)
    const rtree = new ResultTree(qt, RGQLValueInit_CacheStrategy.CACHE_LRU, 50)
    rtree.addResultHandler(decoder.getResultHandler())

    rtree.handleValue(RGQLValue.create({ queryNodeId: 1 }))
    rtree.handleValue(
      RGQLValue.create({
        queryNodeId: 2,
        posIdentifier: 1,
        value: { kind: RGQLPrimitive_Kind.PRIMITIVE_KIND_STRING, stringValue: 'test' },
      }),
    )
    rtree.handleValue(
      RGQLValue.create({
        posIdentifier: 1,
        value: { kind: RGQLPrimitive_Kind.PRIMITIVE_KIND_STRING, stringValue: 'override' },
      }),
    )

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
    const qt = new QueryTree(schema)
    const queryDefs = parse(`
        {
            people {
                name
                height
            }
        }
        `)
    const query = qt.buildQuery(queryDefs.definitions[0] as OperationDefinitionNode)
    const decoder = new JSONDecoder(qt.getRoot(), query)
    const rtree = new ResultTree(qt, RGQLValueInit_CacheStrategy.CACHE_LRU, 50)
    rtree.addResultHandler(decoder.getResultHandler())

    rtree.handleValue(RGQLValue.create({ queryNodeId: 1 }))
    rtree.handleValue(RGQLValue.create({ arrayIndex: 1 }))
    rtree.handleValue(RGQLValue.create({ queryNodeId: 3, value: PackPrimitive(6) }))
    rtree.handleValue(RGQLValue.create({ queryNodeId: 1 }))
    rtree.handleValue(RGQLValue.create({ arrayIndex: 1 }))
    rtree.handleValue(RGQLValue.create({ queryNodeId: 2, value: PackPrimitive('Joe') }))

    expect(decoder.getResult()).toEqual({ people: [{ name: 'Joe', height: 6 }] })
  })
  it('should decode a field alias properly', () => {
    const qt = new QueryTree(schema)
    const queryDefs = parse(`
        {
            people {
                na: name
            }
        }
        `)
    const query = qt.buildQuery(queryDefs.definitions[0] as OperationDefinitionNode)
    const decoder = new JSONDecoder(qt.getRoot(), query)
    const rtree = new ResultTree(qt, RGQLValueInit_CacheStrategy.CACHE_LRU, 50)
    rtree.addResultHandler(decoder.getResultHandler())

    rtree.handleValue(RGQLValue.create({ queryNodeId: 1 }))
    rtree.handleValue(RGQLValue.create({ arrayIndex: 1 }))
    rtree.handleValue(RGQLValue.create({ queryNodeId: 2, value: PackPrimitive('Joe') }))

    expect(decoder.getResult()).toEqual({ people: [{ na: 'Joe' }] })
  })
  it('should decode a complex value properly', () => {
    const qt = new QueryTree(schema)
    const queryDefs = parse(`
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
    const query = qt.buildQuery(queryDefs.definitions[0] as OperationDefinitionNode)
    const decoder = new JSONDecoder(qt.getRoot(), query)
    const rtree = new ResultTree(qt, RGQLValueInit_CacheStrategy.CACHE_LRU, 50)
    rtree.addResultHandler(decoder.getResultHandler())

    rtree.handleValue(RGQLValue.create({ queryNodeId: 1 }))
    rtree.handleValue(RGQLValue.create({ queryNodeId: 2, posIdentifier: 1 }))
    rtree.handleValue(RGQLValue.create({ queryNodeId: 3, value: PackPrimitive('myID') }))
    rtree.handleValue(
      RGQLValue.create({ posIdentifier: 1, queryNodeId: 4, value: PackPrimitive('MyURL') }),
    )
    rtree.handleValue(
      RGQLValue.create({ posIdentifier: 1, queryNodeId: 5, value: PackPrimitive(4) }),
    )
    rtree.handleValue(RGQLValue.create({ queryNodeId: 1 }))
    rtree.handleValue(RGQLValue.create({ queryNodeId: 2 }))
    rtree.handleValue(RGQLValue.create({ queryNodeId: 5, value: PackPrimitive(5) }))

    expect(decoder.getResult()).toEqual({
      image: { header: { url: 'MyURL', id: 'myID', test: 5 } },
    })
  })
})
