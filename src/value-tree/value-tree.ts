import {
  IRGQLValueMutation,
  ValueOperation,
} from 'rgraphql';
import {
  QueryTreeNode,
} from '../query-tree';
import {
  BehaviorSubject,
} from 'rxjs/BehaviorSubject';

export class ValueTreeNode {
  public root: ValueTreeNode;
  public parent: ValueTreeNode;
  public children: ValueTreeNode[] = [];

  public value: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public error: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  // All nodes in the tree listed by ID. Only on the root.
  public rootNodeMap: { [id: number]: ValueTreeNode } = {};
  private id: number;

  constructor(private queryNode: QueryTreeNode,
              root: ValueTreeNode = null,
              parent: ValueTreeNode = null,
              id: number = 0) {
    this.root = root || this;
    this.parent = parent || null;
    this.id = id;

    this.root.rootNodeMap[id] = this;
  }

  public get isRoot() {
    return this.root === this;
  }

  // Apply a value mutation to the tree.
  public applyValueMutation(mutation: IRGQLValueMutation) {
    // Find the referenced node.
    let node: ValueTreeNode = this.root.rootNodeMap[mutation.valueNodeId];
    if (!node) {
      if (mutation.operation === ValueOperation.VALUE_DELETE) {
        return;
      }

      // Create the node. First, find the query tree node for this resolver.
      let qnode: QueryTreeNode = this.queryNode.root.rootNodeMap[mutation.queryNodeId];
      if (!qnode) {
        throw new Error('Query tree node ' + mutation.queryNodeId + ' not found.');
      }

      // Find the parent of the new resolver
      let pnode: ValueTreeNode = this.root.rootNodeMap[mutation.parentValueNodeId];
      if (!pnode) {
        throw new Error('Value tree node (parent) ' + mutation.parentValueNodeId + ' not found.');
      }

      // Push the new node
      node = new ValueTreeNode(qnode, this.root, pnode, mutation.valueNodeId);
      pnode.children.push(node);
    }

    let nval: any;
    if (mutation.valueJson && mutation.valueJson.length) {
        nval = JSON.parse(mutation.valueJson);
    }

    switch (mutation.operation) {
      case ValueOperation.VALUE_SET:
        node.value.next(nval);
        node.error.next(undefined);
        break;
      case ValueOperation.VALUE_DELETE:
        node.dispose();
        break;
      case ValueOperation.VALUE_ERROR:
        node.error.next(nval);
        break;
      default:
        return;
    }
  }

  public removeChild(child: ValueTreeNode, disposeChild: boolean = true) {
    let idx = this.children.indexOf(child);
    if (idx === -1) {
      return;
    }
    this.children.splice(idx, 1);
    if (disposeChild) {
      child.dispose(false);
    }
  }

  public dispose(informParent: boolean = true) {
    if (this.value.isStopped) {
      return;
    }

    // Dispose each child first.
    for (let child of this.children) {
      child.dispose();
    }
    this.children.length = 0;

    // Terminate this value stream.
    this.value.complete();

    if (informParent && this.parent) {
      this.parent.removeChild(this, false);
    }
  }
}
