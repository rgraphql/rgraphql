import {
  FieldNode,
  DirectiveNode,
  ArgumentNode,
  VariableNode,
  ValueNode,
  OperationDefinitionNode,
  VariableDefinitionNode,
  visit,
} from 'graphql';
import {
  VariableStore,
  IVariableReference,
} from '../var-store';
import {
  astValueToJs,
} from '../util/graphql';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

export interface IQueryRemoveable {
  id: number;
  error: BehaviorSubject<any>;
  fullPathPlain: string[];
  removeQuery(query: Query): void;
}

// QueryError represents an issue with one part of the query.
export type QueryError = {
  // Path is a array representation of the path to this node.
  // E.x. ["allPeople", "parents", "name"]
  path: string[];
  error: any;
};

// Represent a query as a subscription.
export class Query {
  public nodes: IQueryRemoveable[] = [];
  public errors: BehaviorSubject<QueryError[]> =
    new BehaviorSubject<QueryError[]>([]);

  private subscribed = true;
  private variablesTransformed = false;
  private queryErrors: { [id: number]: QueryError } = {};
  private queryHandles: Subscription[] = [];

  constructor(public id: number,
              public ast: OperationDefinitionNode,
              private root: IQueryRemoveable,
              private variableStore: VariableStore) {
  }

  public applyNode(queryTreeNode: IQueryRemoveable) {
    this.nodes.push(queryTreeNode);
    this.queryHandles.push(queryTreeNode.error.subscribe((err) => {
      let existingErr = this.queryErrors[queryTreeNode.id];
      if ((!err && !existingErr) || (existingErr === err)) {
        return;
      }
      if (!err) {
        delete this.queryErrors[queryTreeNode.id];
      } else {
        let path: string[] = [];
        if (existingErr && existingErr.path) {
          path = existingErr.path;
        } else {
          path = queryTreeNode.fullPathPlain;
        }
        this.queryErrors[queryTreeNode.id] = {
          error: err,
          path: path,
        };
      }
      this.emitQueryErrors();
    }, null, () => {
      if (this.queryErrors[queryTreeNode.id]) {
        delete this.queryErrors[queryTreeNode.id];
        this.emitQueryErrors();
      }
    }));
  }

  // Traverse AST, transform any variables.
  public transformVariables(variableData: { [name: string]: any }): OperationDefinitionNode {
    if (this.variablesTransformed) {
      return this.ast;
    }
    this.variablesTransformed = true;

    let variableRenameMap: { [oname: string]: IVariableReference } = {};
    let allVariables: IVariableReference[] = [];
    let variableStore = this.variableStore;

    // Transform variable definitions in the query, take any defaults.
    this.ast = visit(this.ast, {
      VariableDefinition(node: VariableDefinitionNode): VariableDefinitionNode {
        let variableName: string = node.variable.name.value;
        let variableDefaultValue: any = undefined;
        let variableValue: any;
        if (node.defaultValue) {
          variableDefaultValue = astValueToJs(node.defaultValue);
        }
        if (variableData.hasOwnProperty(variableName)) {
          variableValue = variableData[variableName];
        } else {
          if (variableDefaultValue === undefined) {
            throw new Error('Variable ' + variableName + ' used but not defined.');
          }
          variableValue = variableDefaultValue;
        }

        let variableRef = variableStore.getVariable(variableValue);
        variableRenameMap[variableName] = variableRef;
        allVariables.push(variableRef);
        return {
          kind: 'VariableDefinition',
          defaultValue: node.defaultValue,
          type: node.type,
          variable: {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: variableRef.name,
            },
          },
        };
      },
    }, null);

    // Traverse ast, replacing all values with variable references...
    this.ast = visit(this.ast, {
      Argument(node: ArgumentNode): ArgumentNode {
        let newVariableName: string;
        if (node.value.kind === 'Variable') {
          let variableName = node.value.name.value;
          let remap = variableRenameMap[variableName];
          if (!remap) {
            throw new Error('BUG! System failed to remap ' + variableName);
          }
          newVariableName = remap.name;
        } else {
          let variableValue: any = astValueToJs(node.value);
          let variableRef = variableStore.getVariable(variableValue);
          allVariables.push(variableRef);
          newVariableName = variableRef.name;
        }

        return {
          kind: 'Argument',
          loc: node.loc,
          name: node.name,
          value: <VariableNode>{
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: newVariableName,
            },
          },
        };
      },
      VariableDefinition() {
        // Skip children of a def.
        return false;
      },
      /* This is handled by Argument above.
      Variable(node: VariableNode): VariableNode {
        // Unfortunately while nice, we can't use this.
        // because graphql will traverse into the variables we make above.
      },
      */
    }, null);

    // Drop all temporary variable subscriptions.
    // The variables won't be cleared until garbageCollect() is called.
    // Before that, given some pre-conditions, we will acquire references to these elsewhere.
    for (let varb of allVariables) {
      varb.unsubscribe();
    }

    return this.ast;
  }

  public unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    this.subscribed = false;

    for (let nod of this.nodes) {
      nod.removeQuery(this);
    }
    for (let sub of this.queryHandles) {
      sub.unsubscribe();
    }
    this.nodes.length = 0;
  }

  private emitQueryErrors() {
    let res: QueryError[] = [];
    for (let queryNodeId in this.queryErrors) {
      if (!this.queryErrors.hasOwnProperty(queryNodeId)) {
        continue;
      }
      res.push(this.queryErrors[queryNodeId]);
    }
    this.errors.next(res);
  }
}
