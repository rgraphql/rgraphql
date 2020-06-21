import { OperationDefinitionNode, visit } from 'graphql'
import { QueryMap } from './query-map'

// Query is a query operation attached to a query tree.
export class Query {
  // queryMap is the query map
  private queryMap: QueryMap | undefined

  constructor(
    // queryID is a unique ID used to identify the query in the query tree.
    private queryID: number,
    // ast is the underlying ast for the query
    public ast: OperationDefinitionNode,
    // variables are any variables set on the query
    public variables: { [key: string]: any } | null
  ) {
    if (!variables) {
      this.variables = {}
    }
    if (ast.operation !== 'query') {
      throw new Error('unsupported operation: ' + ast.operation)
    }
  }

  // getQueryMap returns the query map
  public getQueryMap(): QueryMap | null {
    return this.queryMap || null
  }

  // setQueryMap sets the query map
  public setQueryMap(qm: QueryMap) {
    if (qm) {
      this.queryMap = qm
    }
  }

  // getQueryID returns the query id.
  public getQueryID(): number {
    return this.queryID
  }
}
