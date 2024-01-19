import { OperationDefinitionNode, visit, GraphQLSchema, FieldNode, BREAK } from 'graphql'
import { QueryTreeNode } from './query-tree-node.js'
import { Variable, VariableStore } from './var-store.js'
import {
  ASTVariable,
  RGQLQueryTreeMutation,
  RGQLQueryTreeMutation_NodeMutation,
  RGQLQueryTreeMutation_SubtreeOperation,
  RGQLQueryTreeNode,
} from '../rgraphql.pb.js'
import { QueryNodePurgeHandler, QueryTreeHandler } from './query-tree-handler.js'
import { Query } from './query.js'
import { getLookupType } from './ast.js'
import { QueryMap, QueryMapElem } from './query-map.js'
import { PrimitiveValue } from '../primitive.js'
import { AttachedQuery } from './query-attached.js'

// QueryTree manages merging Query fragments into a single query tree.
export class QueryTree {
  // nextID is the next query node id
  private nextID = 1
  // nextQueryID is the next query ID
  private nextQueryID = 1
  // attachedQueries contains information about each attached query.
  private attachedQueries: { [queryID: number]: AttachedQuery } = {}
  // root is the root of the query tree
  private root: QueryTreeNode
  // varStore is the variable store
  private varStore: VariableStore
  // pendingVariables contains the set of new variables to xmit
  private pendingVariables: ASTVariable[] = []
  // handlers are all query tree handlers
  private handlers: QueryTreeHandler[]
  // qtNodePurgeHandlers are all query tree node purge handlers
  private qtNodePurgeHandlers: QueryNodePurgeHandler[] = []

  constructor(
    // schema is the graphql schema
    private schema: GraphQLSchema,
    // handler handles changes to the tree.
    handler?: QueryTreeHandler,
  ) {
    const queryType = schema.getQueryType()
    if (!queryType) {
      throw new Error('schema has no query type definedj')
    }

    this.varStore = new VariableStore(this.handleNewVariable.bind(this))
    this.root = new QueryTreeNode(0, '', queryType, this.varStore)
    this.handlers = []
    if (handler) {
      this.handlers.push(handler)
    }
  }

  // getGraphQLSchema returns the graphQL schema.
  public getGraphQLSchema(): GraphQLSchema {
    return this.schema
  }

  // getRoot returns the root node.
  public getRoot(): QueryTreeNode {
    return this.root
  }

  // buildQuery creates a new query attached to the query tree.
  public buildQuery(
    ast: OperationDefinitionNode,
    variables?: { [key: string]: PrimitiveValue } | null,
  ): Query {
    const nqid = this.nextQueryID
    this.nextQueryID++
    const query = new Query(nqid, ast, variables || null)
    this.attach(query)
    return query
  }

  // attach attaches a query to the query tree.
  public attach(query: Query) {
    const queryID = query.getQueryID()
    if (queryID in this.attachedQueries) {
      return
    }

    const lookupType = getLookupType(this.schema)
    const varStore = this.varStore
    let qnode: QueryTreeNode = this.root
    let validateErr: Error | null = null
    const attachedQuery = new AttachedQuery(query)
    const newNodes: QueryTreeNode[] = []
    let newNodeDepth = 0

    const qmap: QueryMap = {}
    const qmapStack: QueryMap[] = [qmap]

    visit(query.ast, {
      Field: {
        enter: (node: FieldNode) => {
          // enter the field node
          if (!node.name || !node.name.value || !node.name.value.length) {
            return false
          }

          let childNode: QueryTreeNode | null = null
          try {
            childNode = qnode.resolveChild(node, lookupType, () => {
              const nodeID = this.nextID++
              return new QueryTreeNode(nodeID, '', null, varStore)
            })
          } catch (e) {
            validateErr = e as Error
            return BREAK
          }

          // TODO: verify this
          if (!childNode) {
            return BREAK
          }

          if (childNode.getRefCount() === 0 && newNodeDepth === 0) {
            newNodes.push(childNode)
            newNodeDepth++
          } else if (newNodeDepth) {
            newNodeDepth++
          }

          childNode.incRefCount()
          attachedQuery.appendQueryNode(childNode)
          qnode = childNode

          const qme = qmapStack[qmapStack.length - 1]
          const elem: QueryMapElem = {}
          if (node.selectionSet && node.selectionSet.selections.length) {
            const childQm: QueryMap = {}
            elem.selections = childQm
            qmapStack.push(childQm)
          }
          if (node.alias && node.alias.value) {
            elem.alias = node.alias.value
          }
          qme[qnode.getID()] = elem
          return
        },
        leave(node: FieldNode) {
          // leave the field node
          if (!node.name || !node.name.value || !node.name.value.length) {
            return false
          }

          if (node.selectionSet && node.selectionSet.selections.length) {
            qmapStack.length -= 1
          }

          if (newNodeDepth) {
            newNodeDepth--
          }

          const parent = qnode.getParent()
          if (!parent) {
            throw new Error('expected parent but found none')
          }
          qnode = parent
          return false
        },
      },
    })

    if (validateErr) {
      // purge nodes
      for (const qn of attachedQuery.qtNodes) {
        if (qn.decRefCount() === 0) {
          qn.flagGcNext()
        }
      }
      this.gcSweep()
      this.pendingVariables = []
      throw validateErr
    }

    if (newNodes.length && this.handlers.length) {
      const nodeMutation: RGQLQueryTreeMutation_NodeMutation[] = []
      for (const n of newNodes) {
        n.markXmitted()
        const parent = n.getParent()
        if (!parent) {
          continue
        }
        nodeMutation.push({
          nodeId: parent.getID(),
          node: n.buildProto(),
          operation: RGQLQueryTreeMutation_SubtreeOperation.SUBTREE_ADD_CHILD,
        })
      }

      // TODO: set query ID?
      this.emitToHandlers(
        RGQLQueryTreeMutation.create({
          nodeMutation,
          variables: this.pendingVariables,
        }),
      )
    }

    this.pendingVariables = []
    this.attachedQueries[query.getQueryID()] = attachedQuery
    this.gcSweep()
    query.setQueryMap(qmap)
  }

  // detach detaches a query from the tree.
  public detach(query: Query) {
    const attachedQuery = this.attachedQueries[query.getQueryID()]
    if (!attachedQuery) {
      return
    }

    let gcSweep = false
    for (const nod of attachedQuery.qtNodes) {
      if (nod.decRefCount() === 0) {
        gcSweep = true
        nod.flagGcNext()
      }
    }
    delete this.attachedQueries[query.getQueryID()]

    if (gcSweep) {
      this.gcSweep()
    }
  }

  // attachHandler attaches a handler to the handlers set.
  public attachHandler(handler: QueryTreeHandler) {
    this.handlers.push(handler)
  }

  // removeHandler removes a handler.
  public removeHandler(handler: QueryTreeHandler) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i] === handler) {
        this.handlers[i] = this.handlers[this.handlers.length - 1]
        this.handlers.splice(this.handlers.length - 1, 1)
        break
      }
    }
  }

  // attachQtNodePurgeHandler attaches a query tree node purge handler.
  public attachQtNodePurgeHandler(handler: QueryNodePurgeHandler) {
    this.qtNodePurgeHandlers.push(handler)
  }

  // detachQtNodePurgeHandler detaches a query tree node purge handler.
  public detachQtNodePurgeHandler(handler: QueryNodePurgeHandler) {
    for (let i = 0; i < this.qtNodePurgeHandlers.length; i++) {
      if (this.qtNodePurgeHandlers[i] === handler) {
        this.qtNodePurgeHandlers[i] = this.qtNodePurgeHandlers[this.qtNodePurgeHandlers.length - 1]
        this.qtNodePurgeHandlers.splice(this.qtNodePurgeHandlers.length - 1, 1)
        break
      }
    }
  }

  // buildProto transforms the entire query tree to protobuf format
  public buildProto(): RGQLQueryTreeNode {
    return this.root.buildProto()
  }

  // gcSweep performs a garbage collection sweep.
  public gcSweep() {
    let allUnrefNodes: QueryTreeNode[] = []
    this.root.gcSweep((unrefNodes: QueryTreeNode[]) => {
      if (!unrefNodes || !unrefNodes.length) {
        return
      }
      allUnrefNodes = allUnrefNodes.concat(unrefNodes)
    })
    if (allUnrefNodes.length) {
      const muts: RGQLQueryTreeMutation_NodeMutation[] = []
      for (const n of allUnrefNodes) {
        muts.push(
          RGQLQueryTreeMutation_NodeMutation.create({
            nodeId: n.getID(),
            operation: RGQLQueryTreeMutation_SubtreeOperation.SUBTREE_DELETE,
          }),
        )
      }
      this.emitToHandlers(
        RGQLQueryTreeMutation.create({
          nodeMutation: muts,
        }),
      )
      this.emitToPurgeHandlers(allUnrefNodes)
    }
  }

  // emitToHandlers emits a mutation to handlers.
  private emitToHandlers(mut: RGQLQueryTreeMutation) {
    for (const handler of this.handlers) {
      handler(mut)
    }
  }

  // emitToPurgeHandlers emits a set of query tree nodes to the purge handlers.
  private emitToPurgeHandlers(nodes: QueryTreeNode[]) {
    for (const purgeHandler of this.qtNodePurgeHandlers) {
      for (const node of nodes) {
        purgeHandler(node)
      }
    }
  }

  private handleNewVariable(varb: Variable) {
    this.pendingVariables.push(varb.toProto())
  }
}
