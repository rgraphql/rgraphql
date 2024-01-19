import { ArgumentNode } from 'graphql'
import { IVariableReference, VariableStore } from './var-store.js'
import { astValueToJs } from './ast.js'
import { FieldArgument } from '../rgraphql.pb.js'

// ArgsMap is the flattened arguments map.
export type ArgsMap = { [argName: string]: IVariableReference }

// NewArgsMapFromAST builds a new flattened argumetns map from AST.
export function NewArgsMapFromAST(varStore: VariableStore, args: ArgumentNode[]): ArgsMap {
  const amap: ArgsMap = {}
  if (!args || !args.length) {
    return amap
  }

  for (const arg of args) {
    if (!arg.name || !arg.name.value || !arg.name.value.length) {
      continue
    }

    const jsValue = astValueToJs(arg.value)
    const varRef = varStore.getVariable(jsValue)
    amap[arg.name.value] = varRef
  }

  return amap
}

// ArgsToProto builds protobuf argument set from an args map.
export function ArgsToProto(am: ArgsMap | null): FieldArgument[] {
  if (!am) {
    return []
  }
  const pargs: FieldArgument[] = []
  for (const argID in am) {
    if (!(argID in am)) {
      continue
    }

    pargs.push({
      name: argID,
      variableId: am[argID].id,
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

  for (const k in a1) {
    if (!(k in a1)) {
      continue
    }

    const ovOk = k in a2
    if (!ovOk) {
      return false
    }

    const ov = a2[k]
    if (ov.varb.value !== a1[k].varb.value) {
      return false
    }
  }

  return true
}
