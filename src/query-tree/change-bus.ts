import {
  IRGQLQueryTreeNode,
  IRGQLQueryFieldDirective,
  IASTVariable,
} from 'rgraphql';

export interface ITreeMutation {
  addedNodes?: IRGQLQueryTreeNode[];
  removedNodes?: number[];
  addedVariables?: IASTVariable[];
}

export interface IChangeBus {
  // A mutation was made to the tree.
  applyTreeMutation?(mutation: ITreeMutation): void;
}
