import { IVariableReference, VariableStore } from '../var-store'
import { ArgumentNode } from 'graphql'
import { astValueToJs } from '../util'
import { rgraphql } from 'rgraphql'

// ArgsMap is the flattened arguments map.
export type ArgsMap = { [argName: string]: IVariableReference }

// NewArgsMapFromAST builds a new flattened argumetns map from AST.
export function NewArgsMapFromAST(varStore: VariableStore, args: ArgumentNode[]): ArgsMap {
  let amap: ArgsMap = {}
  if (!args || !args.length) {
    return amap
  }

  for (let arg of args) {
    if (!arg.name || !arg.name.value || !arg.name.value.length) {
      continue
    }

    let jsValue = astValueToJs(arg.value)
    let varRef = varStore.getVariable(jsValue)
    amap[arg.name.value] = varRef
  }

  return amap
}

// ArgsToProto builds protobuf argument set from an args map.
export function ArgsToProto(am: ArgsMap | null): rgraphql.IFieldArgument[] {
  if (!am) {
    return []
  }
  let pargs: rgraphql.IFieldArgument[] = []
  for (let argID in am) {
    if (!am.hasOwnProperty(argID)) {
      continue
    }

    pargs.push({
      name: argID,
      variableId: am[argID].id
    })
  }
  return pargs
}

// CompareArgs compares two argument maps for equality.
export function CompareArgs(a1: ArgsMap | null, a2: ArgsMap | null): boolean {
  if (!a1 && !a2) {
    return true
  }

  if (!a1 || !a2) {
    return false
  }

  if (Object.keys(a1).length !== Object.keys(a2).length) {
    return false
  }

  for (let k in a1) {
    if (!a1.hasOwnProperty(k)) {
      continue
    }

    let ovOk = a2.hasOwnProperty(k)
    if (!ovOk) {
      return false
    }

    let ov = a2[k]
    if (ov.varb.value !== a1[k].varb.value) {
      return false
    }
  }

  return true
}
