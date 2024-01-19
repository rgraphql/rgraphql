import { TypeNode, GraphQLType } from 'graphql'

// LookupASTType follows any NamedNode or similar.
export type LookupASTType = (astType: TypeNode) => GraphQLType | null
