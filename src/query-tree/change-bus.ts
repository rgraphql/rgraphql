import {
  IRGQLQueryTreeNode,
  IRGQLQueryFieldDirective,
} from 'rgraphql';

export interface IChangeBus {
  // A query node was added.
  addQueryNode(node: IRGQLQueryTreeNode): void;
  // A query node was removed.
  removeQueryNode(id: number): void;
  // Add a query directive
  addQueryDirective(nodeId: number, directive: IRGQLQueryFieldDirective): void;
  // Remove a query directive
  removeQueryDirective(nodeId: number, directiveName: string): void;
}
