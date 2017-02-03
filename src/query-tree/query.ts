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

export interface IQueryRemoveable {
  removeQuery(query: Query): void;
}

// Represent a query as a subscription.
export class Query {
  public nodes: IQueryRemoveable[] = [];

  private subscribed = true;
  private variablesTransformed = false;

  constructor(public ast: OperationDefinitionNode,
              private root: IQueryRemoveable,
              private variableStore: VariableStore) {
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

    // Traverse ast, replacing all values with variable references..
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
    this.nodes.length = 0;
  }
}
