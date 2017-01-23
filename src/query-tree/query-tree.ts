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

export class QueryTreeNode implements IQueryTreeNode {
  public root: IQueryTreeNode;
  public parent: IQueryTreeNode;
  public children: IQueryTreeNode[] = [];
  public queries: IQuery[] = [];
  public ast: ASTNode = null;

  // Pull any supplementally-computed stuff out of the ast.
  public directives: DirectiveNode[] = [];
  // Selection set alias. Automatically filled
  public alias: string;

  private aliasCounter: number = 0;

  constructor(root: IQueryTreeNode = null, parent: IQueryTreeNode = null, ast: ASTNode = null) {
    this.root = root || this;
    this.parent = parent || null;
    this.ast = ast || null;
  }

  public get isRoot() {
    return this.root === this;
  }

  // Build AST selection set from this node.
  public buildSelectionSet(): SelectionSetNode {
    if (!this.children || this.children.length === 0) {
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

    let result = new Query(query);
    let self = this;
    visit(query, {
      Field(node: FieldNode, key: string, parent: any, path: any[], ancestors: any[]) {
        let parentNode: QueryTreeNode = self.resolveChild(ancestors);
        if (!parentNode) {
          throw new Error('Could not resolve parents');
        }

        // Resolve or create the child.
        let child = parentNode.resolveChild([node]);
        if (!child) {
          child = parentNode.addChild(node);
        }
        child.addQuery(result);
      },
    }, null);
    return null;
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
        let childName = tchild.alias || tchild.ast.name.value;
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

  private addQuery(query: IQuery) {
    if (this.queries.indexOf(query) !== -1) {
      return;
    }
    this.queries.push(query);
    this.resolveAll();
  }

  private resolveChild(path: ASTNode[]): QueryTreeNode {
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
  private resolveDirectives() {
    let directives: DirectiveNode[] = [];
    for (let query of this.queries) {
      let ast: FieldNode = <any>query.ast;
      if (!ast || !ast.directives) {
        continue;
      }
      for (let dir of ast.directives) {
        // Determine if directives has this one already.
        // If not, add it.
      }
    }
    this.directives = directives;
  }
}
