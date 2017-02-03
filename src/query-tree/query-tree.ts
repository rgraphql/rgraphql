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

export class QueryTreeNode {
  public root: QueryTreeNode;
  public parent: QueryTreeNode;
  public children: QueryTreeNode[] = [];
  public queries: Query[] = [];
  public queriesAst: ASTNode[] = [];
  public queriesAlias: string[] = [];
  public ast: FieldNode = null; // Or an ASTNode

  // Pull any supplementally-computed stuff out of the ast.
  // Directives
  public directives: DirectiveNode[] = [];
  // Arguments
  public args: { [name: string]: IVariableReference };
  // Selection set alias. Automatically filled
  public alias: string;
  // ID of this node in the tree
  public id: number;

  // On the root, we have a map of node ID to node.
  public rootNodeMap?: { [id: number]: QueryTreeNode } = {};
  // On the root, we have a variable store.
  public variableStore?: VariableStore;

  private aliasCounter = 0;
  private gcNext = false;
  private gcPeriod = 200;
  private rootGcTimer: NodeJS.Timer = null;
  private nodeIdCounter: number = 0;
  private cachedFullPath: QueryTreeNode[];
  private changeBus: IChangeBus[] = [];

  private dirtyNodes: QueryTreeNode[];
  private newVariables: Variable[];
  private isDeleted: boolean = false;
  private isNew: boolean = false;

  constructor(root: QueryTreeNode = null,
              parent: QueryTreeNode = null,
              ast: FieldNode = null) {
    this.root = root || this;
    this.parent = parent || null;
    this.ast = ast || null;

    // The root is always going to be id 0.
    this.id = (<any>this.root).nodeIdCounter++;
    (<any>this.root).rootNodeMap[this.id] = this;

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
    // TODO: transmit existing stuff.
    this.changeBus.push(changeBus);
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
      nod = this.parent;
    }
    this.cachedFullPath = res;
    return res;
  }

  public get selectionName() {
    if (!this.ast || this.ast.kind !== 'Field') {
      return;
    }
    let af: FieldNode = <any>this.ast;
    return this.alias || af.name.value;
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
      fieldName: this.ast ? this.ast.name.value : null,
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

    let result = new Query(query, this, this.variableStore);
    // This also validates the document (mostly).
    result.transformVariables(variables);
    let self = this;
    this.addQuery(result, query, null);
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
        child.addQuery(result, node, child.selectionName);
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
    let idx = this.queries.indexOf(query);
    if (idx === -1) {
      return;
    }
    this.queries.splice(idx, 1);
    this.queriesAst.splice(idx, 1);
    this.queriesAlias.splice(idx, 1);
    if (this.queries.length === 0) {
      this.propagateGcNext();
    }
    this.resolveAll();
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

    return this.queries.length > 0;
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
      }, this.gcPeriod);
    }
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
        this.root.dirtyNodes.indexOf(this) === 0) {
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
        let childName = tchild.selectionName;
        if (childName === nodef.name.value) {
          // Alias required.
          let ai = this.aliasCounter++;
          child.alias = childName + ai;
          break;
        }
      }
      let argumentMap: { [name: string]: IVariableReference } = {};
      for (let arg of nodef.arguments) {
        argumentMap[arg.name.value] = this.root.variableStore.getVariableByName(
          (<VariableNode>arg.value).name.value);
      }
      child.args = argumentMap;
    }
    this.children.push(child);
    return child;
  }

  private addQuery(query: Query, ast: ASTNode, alias: string) {
    let idx = this.queries.indexOf(query);
    if (idx !== -1) {
      this.queriesAst[idx] = ast;
      this.queriesAlias[idx] = alias;
      return;
    }
    this.queries.push(query);
    this.queriesAst.push(ast);
    this.queriesAlias.push(alias);
    query.nodes.push(this);
    this.resolveAll();
  }

  // Check if this is reasonably equivilent (same arguments, etc).
  private matchesAst(node: ASTNode): boolean {
    if (node.kind !== this.ast.kind) {
      return false;
    }
    // Compare arguments
    if (node.kind === 'Field') {
      let nf: FieldNode = <any>node;
      let tf: FieldNode = <any>this.ast;

      if (nf.arguments.length !== tf.arguments.length) {
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

  // Resolve everything, given we just added a query.
  private resolveAll() {
    this.resolveDirectives();
  }

  // Compute directives given query directives.
  // This is a bit hard to do.
  // If we have two differing @skip or @include statements, drop completely.
  // Defer is implicit on everything in rgraphql.
  // Upgrade to @live if it exists at all.
  private resolveDirectives() {
    let directives: { [name: string]: DirectiveNode } = {};
    for (let astn of this.queriesAst) {
      let ast: FieldNode = <any>astn;
      if (!ast || !ast.directives) {
        continue;
      }
      for (let dir of ast.directives) {
        // Determine if directives has this one already.
        // If not, add it.
        let dirName = dir.name.value;
        switch (dirName) {
        case 'skip':
        case 'include':
          // TODO: handle skip and include
          break;
        case 'live':
          directives['live'] = {
            kind: 'Directive',
            arguments: [],
            name: {
              kind: 'Name',
              value: 'live',
            },
          };
          break;
        default:
           continue;
        }
      }
    }
    this.directives.length = 0;
    for (let dirn in directives) {
      if (!directives.hasOwnProperty(dirn)) {
        continue;
      }
      this.directives.push(directives[dirn]);
    }
  }

  // On the root, transmit any new nodes via change bus following an operation.
  private handleDirtyNodes() {
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
      mutation.addedNodes.push(nod.buildRGQLTree());
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
