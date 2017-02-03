import {
  ArgumentNode,
  VariableNode,
} from 'graphql';
import {
  IFieldArgument,
} from 'rgraphql';
import {
  VariableStore,
} from '../var-store';

import * as _ from 'lodash';

export type SimplifiedArguments = {
  [name: string]: string,
};

export function simplifyArguments(args: ArgumentNode[]): SimplifiedArguments {
  let res: SimplifiedArguments = {};
  for (let arg of args) {
    res[arg.name.value] = (<VariableNode>arg.value).name.value;
  }
  return res;
}

export function argumentsEquivilent(arg1: SimplifiedArguments, arg2: SimplifiedArguments): boolean {
  return _.isEqual(arg1, arg2);
}

export function argumentsToProto(args: ArgumentNode[], varStore: VariableStore): IFieldArgument[] {
  let res: IFieldArgument[] = [];

  for (let arg of args) {
    let variableName = (<VariableNode>arg.value).name.value;
    let variableRef = varStore.getVariableByName(variableName);
    if (!variableRef) {
      continue;
    }
    variableRef.unsubscribe();
    res.push({
      name: arg.name ? arg.name.value : null,
      variableId: variableRef.id,
    });
  }

  return res;
}
