import { OperationDefinitionNode, visit, FieldNode } from 'graphql'

// QueryMapElem is an element in the query map
export type QueryMapElem = {
  selections?: QueryMap
  alias?: string
}

// QueryMap maps query node IDs to a field alias and the selected sub-fields
export type QueryMap = { [qnid: number]: QueryMapElem }
