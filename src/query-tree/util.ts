import {
  ArgumentNode,
} from 'graphql';

import * as _ from 'lodash';

export type SimplifiedArguments = {
  [name: string]: {
    kind: string,
    value: any,
  },
};

export function simplifyArguments(args: ArgumentNode[]): SimplifiedArguments {
  let res: SimplifiedArguments = {};
  for (let arg of args) {
    res[arg.name.value] = {
      kind: arg.value.kind,
      value: (<any>arg.value).value,
    };
  }
  return res;
}

export function argumentsEquivilent(arg1: SimplifiedArguments, arg2: SimplifiedArguments): boolean {
  return _.isEqual(arg1, arg2);
}
