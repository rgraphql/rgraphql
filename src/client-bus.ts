import {
  ITransport,
} from './transport';
import {
  IRGQLClientMessage,
  IRGQLServerMessage,
  INodeMutation,
  SubtreeOperation,
} from 'rgraphql';
import {
  IChangeBus,
  ITreeMutation,
} from './query-tree/change-bus';
import {
  ISoyuzClientContext,
  ISoyuzSerialOperation,
} from './interfaces';
import { QueryTreeNode } from './query-tree';
import { ValueTreeNode } from './value-tree';

// ClientBus applies query-tree changes to a RGQL transport.
export class ClientBus implements IChangeBus {
  constructor(public transport: ITransport,
              public queryTree: QueryTreeNode,
              public valueTree: ValueTreeNode,
              public serialOperations: { [operationId: number]: ISoyuzSerialOperation }) {
    transport.onMessage((msg: IRGQLServerMessage) => {
      this.handleMessage(msg);
    });
    queryTree.addChangeBus(this);
  }

  public handleMessage(msg: IRGQLServerMessage) {
    if (!this.queryTree || !this.valueTree) {
      return;
    }
    if (msg.queryError) {
      this.queryTree.applyQueryError(msg.queryError);
    }
    if (msg.mutateValue) {
      this.valueTree.applyValueMutation(msg.mutateValue);
    }
    if (msg.serialResponse) {
      let operation = this.serialOperations[msg.serialResponse.operationId];
      if (operation) {
        delete this.serialOperations[msg.serialResponse.operationId];
        operation.handleResult(msg.serialResponse);
      }
    }
  }

  // A mutation was made to the tree.
  public applyTreeMutation(mutation: ITreeMutation) {
    if (!this.transport) {
      return;
    }
    if (mutation.addedNodes.length === 0 &&
        mutation.addedVariables.length === 0 &&
          mutation.removedNodes.length === 0) {
      return;
    }
    let msg: IRGQLClientMessage = {
      mutateTree: {
        variables: mutation.addedVariables,
        nodeMutation: [],
      },
    };
    for (let addedNode of mutation.addedNodes) {
      msg.mutateTree.nodeMutation.push({
        node: addedNode.child,
        nodeId: addedNode.parentId,
        operation: SubtreeOperation.SUBTREE_ADD_CHILD,
      });
    }
    for (let removedNode of mutation.removedNodes) {
      msg.mutateTree.nodeMutation.push({
        nodeId: removedNode,
        operation: SubtreeOperation.SUBTREE_DELETE,
      });
    }
    this.transport.send(msg);
  }

  public dispose() {
    this.queryTree.removeChangeBus(this);
    this.transport = null;
    this.queryTree = null;
    this.valueTree = null;
  }
}
