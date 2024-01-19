import { GraphQLSchema, OperationDefinitionNode, parse } from 'graphql'
import { QueryTree } from './query-tree.js'
import { RunningQuery } from './running-query.js'
import { ResultTree } from './result-tree.js'
import { Query } from './query.js'
import {
  RGQLClientMessage,
  RGQLQueryTreeMutation,
  RGQLServerMessage,
  RGQLValue,
  RGQLValueInit_CacheStrategy,
} from '../rgraphql.pb.js'
import { PrimitiveValue } from '../primitive.js'

// Client implements the rgraphql client.
// It manages one or more query trees.
export class Client {
  // queryTree is the client's primary query tree.
  private queryTree: QueryTree
  // resultTree is the primary result tree / cache
  private resultTree: ResultTree
  // queries is the list of running queries
  private queries: { [key: number]: RunningQuery } = {}
  // queryID is the query id
  private queryID = 1
  // resultID is the result tree id
  private resultID = 0

  constructor(
    public readonly schema: GraphQLSchema,
    private sendMsg: (msg: RGQLClientMessage) => void,
  ) {
    this.queryTree = new QueryTree(schema, this.handleTreeMutation.bind(this))
    this.resultTree = new ResultTree(this.queryTree, RGQLValueInit_CacheStrategy.CACHE_LRU, 100)
    sendMsg(RGQLClientMessage.create({ initQuery: { queryId: this.queryID } }))
  }

  // buildQuery creates a new query.
  public buildQuery(
    ast: OperationDefinitionNode,
    variables?: { [key: string]: PrimitiveValue } | null,
  ): RunningQuery {
    const uquery = this.queryTree.buildQuery(ast, variables)
    const rq = new RunningQuery(uquery, this.resultTree, () => {
      this.disposeQuery(uquery)
    })
    this.queries[rq.getQuery().getQueryID()] = rq
    return rq
  }

  // parseQuery parses and builds a query.
  public parseQuery(
    source: string,
    variables?: { [key: string]: PrimitiveValue } | null,
  ): RunningQuery {
    const defs = parse(source)
    let def: OperationDefinitionNode | undefined
    for (const defi of defs.definitions) {
      if (defi.kind === 'OperationDefinition' && defi.operation) {
        def = defi
      }
    }

    if (!def) {
      throw new Error('no query definition found in source')
    }

    return this.buildQuery(def, variables)
  }

  // getQueryTree returns the query tree.
  public getQueryTree(): QueryTree {
    return this.queryTree
  }

  // handleMessages handles a set of messages in bulk.
  public handleMessages(msgs: RGQLServerMessage[]) {
    for (const msg of msgs) {
      if (msg.valueInit) {
        if (msg.valueInit.queryId !== this.queryID) {
          continue
        }
        this.resultID = msg.valueInit.resultId || 0
      }
      if (msg.valueBatch && msg.valueBatch.resultId === this.resultID && msg.valueBatch.values) {
        for (const valueBin of msg.valueBatch.values) {
          const val = RGQLValue.decode(valueBin)
          this.resultTree.handleValue(val)
        }
      }
    }

    this.resultTree.flushHandlers()
  }

  // handleTreeMutation handles a query tree mutation.
  private handleTreeMutation(mut: RGQLQueryTreeMutation) {
    this.sendMsg(
      RGQLClientMessage.create({
        mutateTree: {
          queryId: this.queryID,
          nodeMutation: mut.nodeMutation,
          variables: mut.variables,
        },
      }),
    )
  }

  // disposeQuery disposes a query and detaches it from the tree.
  private disposeQuery(query: Query) {
    this.queryTree.detach(query)
    delete this.queries[query.getQueryID()]
  }

  // dispose cleans up all queries and disposes the query tree.
  public dispose() {
    this.sendMsg(RGQLClientMessage.create({ finishQuery: { queryId: this.queryID } }))
  }
}
