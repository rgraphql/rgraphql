import {
  DirectiveNode,
  ValueNode,
  VariableNode,
  DocumentNode,
  SelectionNode,
  SelectionSetNode,
  OperationDefinitionNode,
  ASTNode,
  VariableDefinitionNode,
  FieldNode,
  NameNode,
  visit,
} from 'graphql';
import { Query } from './query';
import {
  IRGQLQueryTreeNode,
  IRGQLQueryFieldDirective,
  IRGQLQueryError,
  IFieldArgument,
} from 'rgraphql';
import {
  simplifyArguments,
  argumentsEquivilent,
  argumentsToProto,
} from './util';
import {
  IChangeBus,
  ITreeMutation,
} from './change-bus';
import {
  IVariableReference,
  VariableStore,
  Variable,
} from '../var-store';
import {
  jsToAstValue,
  astValueToType,
} from '../util/graphql';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

export class QueryTreeNode {
  public id: number;
  public fieldName: string = null;
  public alias: string;
  public ast: FieldNode;
  public isList = false;

  public root: QueryTreeNode;
  public parent: QueryTreeNode;
  public children: QueryTreeNode[] = [];

  public queries: { [id: number]: Query } = {};
  public queriesAlias: { [id: number]: string } = {};
  public queriesDirectives: { [id: number]: DirectiveNode[] } = {};

  public queryAdded: Subject<Query> = new Subject<Query>();
  public queryRemoved: Subject<Query> = new Subject<Query>();

  // TODO: Compute directives.
  public directives: DirectiveNode[] = [];
  public args: { [name: string]: IVariableReference };

  public rootNodeMap?: { [id: number]: QueryTreeNode } = {};
  public variableStore?: VariableStore;

  // If this query node is invalid, we will emit an error.
  // This is closed when we dispose this query tree node.
  public error: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private aliasCounter = 0;
  private gcNext = false;
  private gcPeriod = 200;
  private rootGcTimer: NodeJS.Timer = null;
  private nodeIdCounter = 0;
  private queryIdCounter = 0;
  private cachedFullPath: QueryTreeNode[];
  private changeBus: IChangeBus[] = [];

  private dirtyNodes: QueryTreeNode[];
  private newVariables: Variable[];
  private isDeleted = false;
  private isNew = false;

  constructor(root: QueryTreeNode = null,
              parent: QueryTreeNode = null,
              ast: FieldNode = null) {
    this.root = root || this;
    this.parent = parent || null;
    this.ast = ast || null;

    // The root is always going to be id 0.
    this.id = (<any>this.root).nodeIdCounter++;
    (<any>this.root).rootNodeMap[this.id] = this;

    if (ast && ast.name) {
      this.fieldName = ast.name.value;
    }

    if (!this.isRoot) {
      let nod: QueryTreeNode = this;
      let skipNew = false;
      while (nod.parent && nod !== this.root) {
        if (nod.isNew) {
          skipNew = true;
          break;
        }
        nod = nod.parent;
      }
      if (!skipNew) {
        this.isNew = true;
        this.root.dirtyNodes.push(this);
      }
    } else {
      this.dirtyNodes = [];
      this.newVariables = [];
      this.variableStore = new VariableStore();
      this.variableStore.newVariables.subscribe((nvar: Variable) => {
        this.newVariables.push(nvar);
      });
    }
  }

  public addChangeBus(changeBus: IChangeBus) {
    if (!this.isRoot) {
      this.root.addChangeBus(changeBus);
      return;
    }
    if (this.changeBus.indexOf(changeBus) !== -1) {
      return;
    }
    this.xmitChangeBusSnapshot(changeBus);
    this.changeBus.push(changeBus);
  }

  public removeChangeBus(changeBus: IChangeBus) {
    if (!this.isRoot) {
      this.root.removeChangeBus(changeBus);
      return;
    }
    let idx = this.changeBus.indexOf(changeBus);
    if (idx === -1) {
      return;
    }
    this.changeBus.splice(idx, 1);
  }

  public get isRoot() {
    return this.root === this;
  }

  public get fullPath(): QueryTreeNode[] {
    if (this.cachedFullPath) {
      return this.cachedFullPath;
    }

    let res: QueryTreeNode[] = [this];
    let nod = this.parent;
    while (nod) {
      res.unshift(nod);
      nod = nod.parent;
    }
    this.cachedFullPath = res;
    return res;
  }

  public get fullPathPlain(): string[] {
    let fp = this.fullPath;
    let res: string[] = [];
    for (let nod of fp) {
      let nam = nod.fieldName;
      if (!nam) {
        continue;
      }
      res.push(nam);
    }
    return res;
  }

  // Build AST selection set from this node.
  public buildSelectionSet(): SelectionSetNode {
    if (this.children.length < 1) {
      return null;
    }

    let sels: SelectionNode[] = [];
    for (let child of this.children) {
      let childAst: any = child.buildAst();
      if (!childAst) {
        continue;
      }
      sels.push(childAst);
    }
    return {
      kind: 'SelectionSet',
      selections: sels,
    };
  }

  // Build a proto tree representation of this node.
  public buildRGQLTree(includeChildren = false): IRGQLQueryTreeNode {
    let result: IRGQLQueryTreeNode = {
      id: this.id,
      fieldName: this.fieldName,
      directive: this.buildRGQLDirectives(),
    };
    if (this.ast && this.ast.arguments) {
      result.args = argumentsToProto(this.ast.arguments, this.root.variableStore);
    }
    if (includeChildren) {
      let children: IRGQLQueryTreeNode[] = result.children = [];
      for (let child of this.children) {
        children.push(child.buildRGQLTree(includeChildren));
      };
    }
    return result;
  }

  // Build a proto representation of our directives.
  public buildRGQLDirectives(): IRGQLQueryFieldDirective[] {
    let result: IRGQLQueryFieldDirective[] = [];
    for (let dir of this.directives) {
      result.push({
        name: dir.name.value,
        args: argumentsToProto(dir.arguments, this.root.variableStore),
      });
    }
    return result;
  }

  // Build AST again from this tree.
  public buildAst(): ASTNode {
    let ast: ASTNode = this.ast;
    let sels = this.buildSelectionSet();

    if (this.isRoot) {
      let variableDefs: VariableDefinitionNode[] = [];
      this.variableStore.forEach((variable) => {
        let av = jsToAstValue(variable.value);
        variableDefs.push({
          kind: 'VariableDefinition',
          defaultValue: av,
          variable: {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: variable.name,
            },
          },
          type: astValueToType(av),
        });
      });
      return <OperationDefinitionNode>{
        kind: 'OperationDefinition',
        directives: this.directives || [],
        operation: 'query',
        name: {
          kind: 'Name',
          value: 'rootQuery',
        },
        selectionSet: sels,
        variableDefinitions: variableDefs,
      };
    }

    if (!ast) {
      return null;
    }

    switch (ast.kind) {
      case 'Field':
        let r = <FieldNode>{
          kind: 'Field',
          name: {
            kind: 'Name',
            value: ast.name.value,
          },
          arguments: ast.arguments,
          directives: this.directives || [],
          selectionSet: sels,
        };

        if (this.alias) {
          r.alias = {
            kind: 'Name',
            value: this.alias,
          };
        }

        return r;
      default:
        return null;
    }
  }

  public buildQuery(query: OperationDefinitionNode,
                    variables: { [name: string]: any }): Query {
    if (query.kind !== 'OperationDefinition' || query.operation !== 'query') {
      throw new Error('buildQuery expects a query operation.');
    }

    let result = new Query(this.queryIdCounter++, query, this, this.variableStore);
    query = result.transformVariables(variables);
    let self = this;
    this.addQuery(result, null, null);
    visit(query, {
      Field(node: FieldNode, key: string, parent: any, path: any[], ancestors: any[]) {
        let parentNode = self.resolveChild(ancestors);
        if (!parentNode) {
          throw new Error('Could not resolve parents');
        }

        // Resolve or create the child.
        let child: QueryTreeNode = <any>parentNode.resolveChild([node]);
        if (!child) {
          child = <any>parentNode.addChild(node);
        }
        let aliasName = node.alias ? node.alias.value : node.name.value;
        child.addQuery(result, node, aliasName);
      },
    }, null);
    this.root.handleDirtyNodes();
    return result;
  }

  public resolveChild(path: ASTNode[]): QueryTreeNode {
    let current: QueryTreeNode = this;
    for (let part of path) {
      // Filter to just things representable as QueryTreeNode
      if (part.kind !== 'Field') {
        continue;
      }
      if (!current.children) {
        throw new Error('No children of node, looking for ' + part + ' of ' + path + '.');
      }
      let ic = current.children;
      current = null;
      for (let child of ic) {
        if (child.matchesAst(part)) {
          current = child;
          break;
        }
      }
      if (!current) {
        return null;
      }
    }
    return current;
  }

  public removeQuery(query: Query) {
    let id = query.id;
    if (!this.queries[id]) {
      return;
    }
    delete this.queries[id];
    delete this.queriesAlias[id];
    delete this.queriesDirectives[id];
    this.queryRemoved.next(query);

    if (Object.keys(this.queries).length === 0) {
      this.propagateGcNext();
    }
  }

  public garbageCollect(): boolean {
    if (this.gcNext) {
      this.gcNext = false;
      // let ir = this.isRoot;
      let nchildren: QueryTreeNode[] = [];
      for (let child of this.children) {
        let keep = child.garbageCollect();
        if (keep) {
          nchildren.push(<any>child);
        } else {
          child.dispose();
        }
      }
      this.children = nchildren;
    }

    return Object.keys(this.queries).length > 0;
  }

  public propagateGcNext() {
    if (this.gcNext) {
      return;
    }
    this.gcNext = true;
    if (this.parent && this.parent !== this) {
      this.parent.propagateGcNext();
    }
    if (this.isRoot && !this.rootGcTimer) {
      this.rootGcTimer = setTimeout(() => {
        this.rootGcTimer = null;
        this.garbageCollect();
        this.handleDirtyNodes();
      }, this.gcPeriod);
    }
  }

  public applyQueryError(err: IRGQLQueryError) {
    let nod = this.root.rootNodeMap[err.queryNodeId];
    if (!nod) {
      return;
    }
    nod.error.next(JSON.parse(err.errorJson));
  }

  public dispose() {
    if (this.rootGcTimer) {
      clearTimeout(this.rootGcTimer);
    }
    if (this.root && this.root.rootNodeMap) {
      delete this.root.rootNodeMap[this.id];
    }
    this.isDeleted = true;
    if (this.root &&
        this.root.dirtyNodes &&
        this.root.dirtyNodes.indexOf(this) === -1) {
      this.root.dirtyNodes.push(this);
    }
    if (this.args) {
      for (let argumentName in this.args) {
        if (!this.args.hasOwnProperty(argumentName)) {
          continue;
        }
        this.args[argumentName].unsubscribe();
      }
      this.args = null;
    }
    for (let child of this.children) {
      child.dispose();
    }
    this.children.length = 0;
    this.rootNodeMap = null;
    this.error.complete();
  }

  private addChild(node: FieldNode): QueryTreeNode {
    let child = new QueryTreeNode(this.root, this, node);
    if (node.kind === 'Field') {
      let nodef: FieldNode = <any>node;
      for (let childn of this.children) {
        let tchild: QueryTreeNode = <any>childn;
        if (!tchild.ast || tchild.ast.kind !== 'Field') {
          continue;
        }
        let childName = tchild.alias || tchild.fieldName;
        if (childName === nodef.name.value) {
          // Alias required.
          let ai = this.aliasCounter++;
          child.alias = childName + ai;
          break;
        }
      }
      let argumentMap: { [name: string]: IVariableReference } = {};
      for (let arg of nodef.arguments) {
        let variableName = (<VariableNode>arg.value).name.value;
        let variableRef = this.root.variableStore.getVariableByName(variableName);
        argumentMap[arg.name.value] = variableRef;
      }
      child.args = argumentMap;
    }
    this.children.push(child);
    return child;
  }

  private addQuery(query: Query, ast?: FieldNode, alias?: string) {
    let id = query.id;
    if (this.queries[id]) {
      return;
    }
    this.queries[id] = query;
    this.queriesAlias[id] = alias;
    this.queriesDirectives[id] = ast ? ast.directives : null;
    // don't save ast for now.
    query.applyNode(this);
    this.queryAdded.next(query);
  }

  // Check if this is reasonably equivilent (same arguments, etc).
  // TODO: Simplify to use arguments array, remove this.ast completely
  private matchesAst(node: ASTNode): boolean {
    if (node.kind !== this.ast.kind) {
      return false;
    }
    // Compare arguments & field name
    if (node.kind === 'Field') {
      let nf: FieldNode = <any>node;
      let tf: FieldNode = <any>this.ast;

      if (nf.arguments.length !== tf.arguments.length ||
          nf.name.value !== tf.name.value) {
        return false;
      }

      // They might be out of order, build an object simplifing them.
      let nfa = simplifyArguments(nf.arguments || []);
      let tfa = simplifyArguments(tf.arguments || []);

      // Compare the two
      if (!argumentsEquivilent(nfa, tfa)) {
        return false;
      }
    }
    return true;
  }

  // On the root, transmit a full snapshot of the tree.
  private xmitChangeBusSnapshot(changeBus: IChangeBus) {
    let mutation: ITreeMutation = {
      addedNodes: [],
      removedNodes: [],
      addedVariables: [],
    };
    for (let child of this.children) {
      let ctree = child.buildRGQLTree(true);
      mutation.addedNodes.push({
        parentId: this.id,
        child: ctree,
      });
    }
    this.variableStore.forEach((vb) => {
      mutation.addedVariables.push(vb.toProto());
    });
    changeBus.applyTreeMutation(mutation);
  }

  // On the root, transmit any new nodes via change bus following an operation.
  private handleDirtyNodes() {
    // Note! You cannot add a variable without adding the referenced nodes.
    if (this.dirtyNodes.length === 0) {
      return;
    }

    let mutation: ITreeMutation = {
      addedNodes: [],
      removedNodes: [],
      addedVariables: [],
    };

    for (let nod of this.dirtyNodes) {
      if (nod.isDeleted) {
        mutation.removedNodes.push(nod.id);
        continue;
      }
      nod.isNew = false;
      mutation.addedNodes.push({
        parentId: nod.parent.id,
        child: nod.buildRGQLTree(true),
      });
    }

    for (let nvar of this.newVariables) {
      if (!nvar.hasReferences) {
        continue;
      }
      mutation.addedVariables.push(nvar.toProto());
    }

    for (let cb of this.changeBus) {
      if (cb.applyTreeMutation) {
        cb.applyTreeMutation(mutation);
      }
    }

    this.dirtyNodes.length = 0;
    this.newVariables.length = 0;
    this.variableStore.garbageCollect();
  }
}
