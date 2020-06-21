import { FieldNode, FieldDefinitionNode, ArgumentNode, GraphQLObjectType } from 'graphql'
import { ArgsMap, ArgsToProto, CompareArgs, NewArgsMapFromAST } from './args-map'
import { VariableStore } from '../var-store'
import { rgraphql } from 'rgraphql'
import { LookupASTType } from '../util/type-lookup'
import { FieldNotFoundError, TypeNotFoundError } from './errors'
import { isAstPrimitive, unwrapAstType } from '../util'

// QueryTreeNode is a field / object selector in the query tree.
export class QueryTreeNode {
  // children contains the child nodes
  private children: QueryTreeNode[] = []
  // args contains the arguments
  // will be nil if there are no arguments.
  private args: ArgsMap | null = null
  // parent points to the parent node
  private parent: QueryTreeNode | null = null

  // refCount is the number of references to the node
  private refCount: number = 0
  // gcNext indicates this node should be swept
  private gcNext: boolean | undefined
  // xmitted indicates this node has been transmitted
  private xmitted: boolean | undefined

  constructor(
    // id is this query node id
    private id: number,
    // name is the name of this query node field.
    private name: string,
    // objDef contains the schema object definition for this node.
    // will be nil if this is a primitive.
    private objDef: GraphQLObjectType | null,
    // varStore contains a pointer to the variable store
    private varStore: VariableStore
  ) {}

  // buildProto constructs the protobuf representation.
  public buildProto(): rgraphql.IRGQLQueryTreeNode {
    let children: rgraphql.IRGQLQueryTreeNode[] = []
    for (let child of this.children) {
      children.push(child.buildProto())
    }

    return {
      id: this.id,
      fieldName: this.name,
      args: ArgsToProto(this.args),
      children,
      directive: []
    }
  }

  // flagGcNext marks the node for garbage collection
  public flagGcNext() {
    this.gcNext = true

    if (this.parent) {
      this.parent.flagGcNext()
    }
  }

  // matchesField checks if the node matches the field.
  public matchesField(fieldName: string, args: ArgsMap): boolean {
    if (fieldName !== this.name) {
      return false
    }

    return CompareArgs(args, this.args)
  }

  // lookupChildByID looks for an existing child with a query node ID. reference count is not incremented.
  // nil is returned if the node is not found.
  public lookupChildByID(qnID: number): QueryTreeNode | null {
    for (let child of this.children) {
      if (child.id === qnID) {
        return child
      }
    }

    return null
  }

  // getID returns the query node id
  public getID(): number {
    return this.id
  }

  // getName returns the field name.
  public getName(): string {
    return this.name || ''
  }

  // getParent returns the parent.
  public getParent(): QueryTreeNode | null {
    return this.parent
  }

  // getRefCount returns the ref count.
  public getRefCount(): number {
    return this.refCount
  }

  // incRefCount increments the ref count and returns it.
  public incRefCount(): number {
    this.refCount++
    return this.refCount
  }

  // decRefCount decrements the ref count and returns it.
  public decRefCount(): number {
    if (this.refCount > 0) {
      this.refCount--
    }
    return this.refCount
  }

  public resolveChild(
    field: FieldNode,
    lookupType: LookupASTType,
    allocNode: () => QueryTreeNode
  ): QueryTreeNode {
    let fieldName = field.name.value
    let childFieldDef = this.findSchemaField(fieldName)
    if (!childFieldDef) {
      throw new FieldNotFoundError(`field ${fieldName} not found`)
    }

    let atdObj: GraphQLObjectType | null = null
    let childFieldType = childFieldDef.type
    let childFieldTypeUnderlying = unwrapAstType(childFieldType)
    if (!isAstPrimitive(childFieldTypeUnderlying)) {
      let atd = lookupType(childFieldTypeUnderlying)
      if (atd) {
        // hack
        let atdv = atd as any
        if (atdv.astNode && atdv.astNode.kind === 'ObjectTypeDefinition') {
          atdObj = atd as GraphQLObjectType
        }
      }

      if (!atdObj) {
        if (childFieldType.kind === 'NamedType') {
          throw new TypeNotFoundError('type ' + childFieldType.name.value + ' not found')
        }
        throw new TypeNotFoundError('[unknown reference type]')
      }
    }

    let argsm = NewArgsMapFromAST(this.varStore, field.arguments as ArgumentNode[])
    for (let child of this.children) {
      if (child.matchesField(field.name.value, argsm)) {
        return child
      }
    }

    let childNod = allocNode()
    childNod.varStore = this.varStore
    childNod.args = argsm
    childNod.name = fieldName
    childNod.objDef = atdObj
    childNod.parent = this
    this.children.push(childNod)
    return childNod
  }

  // findSchemaField looks up a field by name.
  public findSchemaField(fieldName: string): FieldDefinitionNode | null {
    if (!this.objDef || !this.objDef.astNode) {
      return null
    }

    let fields = this.objDef.astNode.fields
    if (!this.objDef || !fields) {
      return null
    }

    for (let field of fields) {
      if (!field.name || !field.name.value || !field.name.value.length) {
        continue
      }

      if (fieldName === field.name.value) {
        return field
      }
    }

    return null
  }

  // gcSweep GC sweeps the node and returns if there are any references.
  // if the node has no references, will not emit any messages.
  // each unreferenced child is deleted and emitted
  // Untransmitted nodes are not emitted.
  public gcSweep(purgeNodesCb: (purgedNodes: QueryTreeNode[]) => void): boolean {
    let unrefChildren: QueryTreeNode[] = []
    if (this.gcNext) {
      this.gcNext = false
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        if (!child.gcSweep(purgeNodesCb)) {
          this.children[i] = this.children[this.children.length - 1]
          this.children.splice(this.children.length - 1, 1)
          if (child.xmitted) {
            unrefChildren.push(child)
          }
          i--
        }
      }
    }

    let qReferenced = this.refCount !== 0 || !this.parent
    if (unrefChildren.length !== 0 && qReferenced) {
      purgeNodesCb(unrefChildren)
    }
    return qReferenced
  }

  // markXmitted marks the node as transmitted.
  public markXmitted() {
    if (this.xmitted) {
      return
    }
    this.xmitted = true
    for (let child of this.children) {
      child.markXmitted()
    }
  }
}
