import {
  IQuery,
  IQueryTreeNode,
} from './interfaces';
import {
  DirectiveNode,
  ValueNode,
  DocumentNode,
  SelectionNode,
  SelectionSetNode,
  OperationDefinitionNode,
  ASTNode,
  FieldNode,
  NameNode,
  visit,
} from 'graphql';
import { Query } from './query';
import { simplifyArguments, argumentsEquivilent } from './util';
import {
  BehaviorSubject,
} from 'rxjs/BehaviorSubject';

export class QueryTreeNode implements IQueryTreeNode {
  public root: IQueryTreeNode;
  public parent: IQueryTreeNode;
  public children: IQueryTreeNode[] = [];
  public queries: IQuery[] = [];
  public queriesAst: ASTNode[] = [];
  public queriesAlias: string[] = [];
  public ast: ASTNode = null;
  public value = new BehaviorSubject<any>(null);

  // Pull any supplementally-computed stuff out of the ast.
  public directives: DirectiveNode[] = [];
  // Selection set alias. Automatically filled
  public alias: string;

  private aliasCounter = 0;
  private gcNext = false;
  private gcPeriod = 200;
  private rootGcTimer: NodeJS.Timer = null;

  constructor(root: IQueryTreeNode = null, parent: IQueryTreeNode = null, ast: ASTNode = null) {
    this.root = root || this;
    this.parent = parent || null;
    this.ast = ast || null;
  }

  public get isRoot() {
    return this.root === this;
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
    for (let childn of this.children) {
      let child: QueryTreeNode = <any>childn;
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

  // Build AST again from this tree.
  public buildAst(): ASTNode {
    let ast: ASTNode = this.ast;
    let sels = this.buildSelectionSet();

    if (this.isRoot) {
      return <OperationDefinitionNode>{
        kind: 'OperationDefinition',
        directives: this.directives || [],
        operation: 'query',
        name: {
          kind: 'Name',
          value: 'rootQuery',
        },
        selectionSet: sels,
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

  public buildQuery(query: OperationDefinitionNode): IQuery {
    if (query.kind !== 'OperationDefinition' || query.operation !== 'query') {
      throw new Error('buildQuery expects a query operation.');
    }

    let result = new Query(query, this);
    let self = this;
    this.addQuery(result, query, null);
    // TODO: handle variables (in particular: in matchesAst)
    visit(query, {
      Field(node: FieldNode, key: string, parent: any, path: any[], ancestors: any[]) {
        let parentNode: QueryTreeNode = <any>self.resolveChild(ancestors);
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
    return result;
  }

  public resolveChild(path: ASTNode[]): IQueryTreeNode {
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
        let childn: QueryTreeNode = <any>child;
        if (childn.matchesAst(part)) {
          current = childn;
          break;
        }
      }
      if (!current) {
        return null;
      }
    }
    return current;
  }

  public removeQuery(query: IQuery) {
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
    for (let child of this.children) {
      child.dispose();
    }
    this.children.length = 0;
  }

  private addChild(node: ASTNode): QueryTreeNode {
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
}
