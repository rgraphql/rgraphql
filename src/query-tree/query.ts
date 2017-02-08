import {
  FieldNode,
  DirectiveNode,
  ArgumentNode,
  VariableNode,
  OperationDefinitionNode,
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
      this.emitQueryErrors();
    }));
  }

  // Traverse AST, transform any variables.
  public transformVariables(variableData: { [name: string]: any }) {
    if (this.variablesTransformed) {
      return;
    }
    this.variablesTransformed = true;

    let variableRenameMap: { [oname: string]: IVariableReference } = {};
    let allVariables: IVariableReference[] = [];

    // Transform variable definitions in the query, take any defaults.
    this.ast.variableDefinitions = this.ast.variableDefinitions || [];
    for (let vardef of this.ast.variableDefinitions) {
      let variableName: string = vardef.variable.name.value;
      let variableDefaultValue: any;
      let variableValue: any;
      if (vardef.defaultValue) {
        variableDefaultValue = astValueToJs(vardef.defaultValue);
      }
      if (variableData.hasOwnProperty(variableName)) {
        variableValue = variableData[variableName];
      } else {
        variableValue = variableDefaultValue;
      }
      let variableRef = this.variableStore.getVariable(variableValue);
      variableRenameMap[variableName] = variableRef;
      allVariables.push(variableRef);
      vardef.variable.name.value = variableRef.name;
    }

    let processArguments = (args: ArgumentNode[]) => {
      for (let argument of args) {
        if (argument.value.kind === 'Variable') {
          let varNode: VariableNode = argument.value;
          let variableName = varNode.name.value;
          let variableRef = variableRenameMap[variableName];
          if (!variableRef) {
            throw new Error(`Variable ${variableName} not defined.`);
          }
          varNode.name.value = variableRef.name;
        } else {
          let variableValue: any = astValueToJs(argument.value);
          let variableRef = this.variableStore.getVariable(variableValue);
          allVariables.push(variableRef);
          argument.value = <VariableNode>{
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: variableRef.name,
            },
          };
        }
      }
    };

    // Traverse ast, replacing all values with variable references...
    visit(this.ast, {
      Field: (node: FieldNode) => {
        if (!node.arguments) {
          return;
        }
        processArguments(node.arguments);
      },
      Directive: (node: DirectiveNode) => {
        if (!node.arguments) {
          return;
        }
        processArguments(node.arguments);
      },
    }, null);

    // Drop all temporary variable subscriptions.
    // The variables won't be cleared until garbageCollect() is called.
    // Before that, given some pre-conditions, we will acquire references to these elsewhere.
    for (let varb of allVariables) {
      varb.unsubscribe();
    }
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
