import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  ITransport,
} from './transport';
import {
  IRGQLClientMessage,
  IRGQLServerMessage,
  INodeMutation,
  SubtreeOperation,
  RGQLValue,
  IRGQLValue,
} from 'rgraphql';
import {
  IChangeBus,
  ITreeMutation,
} from './query-tree/change-bus';
import { QueryTreeNode } from './query-tree';
import { ResultTree } from './result';
import { ObservableQuery } from './query';

// RunningQuery applies query-tree changes to a RGQL transport and manages a result tree.
export class RunningQuery implements IChangeBus {
  // query ID
  public id: number;
  // value tree
  public resultTree: BehaviorSubject<ResultTree> = new BehaviorSubject<ResultTree>(null);

  constructor(public transport: ITransport,
              public queryTree: QueryTreeNode,
              public operation: string) {
    this.id = transport.nextQueryId();
    transport.onMessage((msg: IRGQLServerMessage) => {
      this.handleMessage(msg);
    });
    transport.send({
      initQuery: {
        queryId: this.id,
        operationType: operation,
      },
    });
    queryTree.addChangeBus(this);
  }

  public handleMessage(msg: IRGQLServerMessage) {
    if (!this.queryTree) {
      return;
    }

    if (msg.valueInit && msg.valueInit.queryId === this.id) {
      let vi = msg.valueInit;
      let vt = new ResultTree(vi.resultId, this.queryTree, vi.cacheStrategy, vi.cacheSize);
      this.resultTree.next(vt);
    }

    let rt = this.resultTree.value;
    if (!rt) {
      return;
    }

    if (msg.valueBatch && msg.valueBatch.resultId === rt.id) {
      for (let seg of msg.valueBatch.values) {
        let val: IRGQLValue = RGQLValue.decode(seg).toObject();
        this.resultTree.value.handleSegment(val);
      }
    }

    if (msg.queryError && msg.queryError.queryId === this.id) {
      this.queryTree.applyQueryError(msg.queryError);
    }

    if (msg.valueFinalize && msg.valueFinalize.resultId === rt.id) {
      this.dispose();
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
        queryId: this.id,
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
    this.resultTree.complete();
  }
}
