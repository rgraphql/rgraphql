import {
  IRGQLValueMutation,
  ValueOperation,
} from 'rgraphql';
import {
  QueryTreeNode,
} from '../query-tree';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

export class ValueTreeNode {
  public id: number;
  public root: ValueTreeNode;
  public parent: ValueTreeNode;
  public children: ValueTreeNode[] = [];
  public isArray = false;

  public value = new BehaviorSubject<any>(undefined);
  public error = new BehaviorSubject<any>(undefined);
  public valueUpdated = new BehaviorSubject<Date>(new Date());
  public childAdded = new Subject<ValueTreeNode>();

  // All nodes in the tree listed by ID. Only on the root.
  public rootNodeMap: { [id: number]: ValueTreeNode };
  // Orphaned mutations with parents waiting to come down the wire.
  public rootPendingNodeMap: { [parentId: number]: IRGQLValueMutation[] };
  private cleanupSubscriptions: Subscription[];

  constructor(public queryNode: QueryTreeNode,
              root: ValueTreeNode = null,
              parent: ValueTreeNode = null,
              id = 0) {
    this.root = root || this;
    this.parent = parent || null;
    this.id = id;
    this.cleanupSubscriptions = [];

    if (this.root === this) {
      this.rootNodeMap = {};
      this.rootPendingNodeMap = {};
    }
    this.root.rootNodeMap[id] = this;
    this.cleanupSubscriptions.push(
      queryNode.error.subscribe((err) => {
        if (err) {
          this.dispose();
        }
      }, null, () => {
        this.dispose();
      }),
    );
  }

  public get isRoot() {
    return this.root === this;
  }

  // Apply a value mutation to the tree.
  public applyValueMutation(mutation: IRGQLValueMutation) {
    // Find the referenced node.
    let node: ValueTreeNode = this.root.rootNodeMap[mutation.valueNodeId || 0];
    if (!node) {
      if (mutation.operation === ValueOperation.VALUE_DELETE) {
        return;
      }

      // Create the node. First, find the query tree node for this resolver.
      let qnode: QueryTreeNode = this.queryNode.root.rootNodeMap[mutation.queryNodeId || 0];
      if (!qnode) {
        // We have already unsubscribed from this.
        return;
      }

      // Find the parent of the new resolver
      let pnode: ValueTreeNode = this.root.rootNodeMap[mutation.parentValueNodeId || 0];
      if (!pnode) {
        // throw new Error('Value tree node (parent) ' + mutation.parentValueNodeId + ' not found.');
        // console.log(`Orphan: ${JSON.stringify(mutation.valueNodeId)}`);
        let a = this.root.rootPendingNodeMap[mutation.parentValueNodeId] || [];
        a.push(mutation);
        this.root.rootPendingNodeMap[mutation.parentValueNodeId] = a;
        return;
      }

      // Push the new node
      node = new ValueTreeNode(qnode, this.root, pnode, mutation.valueNodeId || 0);
      node.isArray = mutation.isArray || false;
      pnode.children.push(node);
      pnode.childAdded.next(node);

      // Find any orphaned nodes tied to this parent.
      let orphans = this.root.rootPendingNodeMap[mutation.valueNodeId];
      if (orphans) {
        delete this.root.rootPendingNodeMap[mutation.valueNodeId];
        setTimeout(() => {
          for (let orphan of orphans) {
            this.applyValueMutation(orphan);
          }
        }, 0);
      }
    }

    let nval: any = undefined;
    if (mutation.hasValue && mutation.valueJson && mutation.valueJson.length) {
      nval = JSON.parse(mutation.valueJson);
    }

    switch (mutation.operation || 0) {
      case ValueOperation.VALUE_SET:
        node.value.next(nval);
        node.valueUpdated.next(new Date());
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

  public removeChild(child: ValueTreeNode, disposeChild = true) {
    let idx = this.children.indexOf(child);
    if (idx === -1) {
      return;
    }
    this.children.splice(idx, 1);
    if (disposeChild) {
      child.dispose(false);
    }
  }

  public dispose(informParent = true) {
    if (this.value.isStopped) {
      return;
    }

    for (let sub of this.cleanupSubscriptions) {
      sub.unsubscribe();
    }
    this.cleanupSubscriptions.length = 0;

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
