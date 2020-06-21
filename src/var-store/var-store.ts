import { NameCounter } from '../name-counter'
import { rgraphql, PackPrimitive, UnpackPrimitive } from 'rgraphql'

// Stored variable reference.
export interface IVariableReference {
  // ID
  id: number
  // Name
  name: string
  // Variable
  varb: Variable
  // Make another reference to this variable.
  // Returns undefined if the variable has been deleted.
  clone(): IVariableReference | undefined
  // We no longer are referencing this variable.
  unsubscribe(): void
}

// Stored variable.
export class Variable {
  public removed = false

  private referenceCounter = 0
  private references: number[] = []

  constructor(public id: number, public name: string, public value: any) {}

  public toProto(): rgraphql.IASTVariable {
    return {
      id: this.id,
      value: PackPrimitive(this.value)
    }
  }

  public get hasReferences(): boolean {
    return this.references.length > 0
  }

  public addReference(): IVariableReference {
    let refId = ++this.referenceCounter
    this.references.push(refId)
    let unsubbed = false
    return {
      id: this.id,
      name: this.name,
      varb: this,
      clone: () => {
        if (unsubbed) {
          return
        }
        return this.addReference()
      },
      unsubscribe: () => {
        if (unsubbed) {
          return
        }
        unsubbed = true
        let idx = this.references.indexOf(refId)
        if (idx === -1) {
          return
        }
        this.references.splice(idx, 1)
      }
    }
  }
}

// AddVariableCallback is called when a new variable is added.
export type AddVariableCallback = (varb: Variable) => void

// Variable storage for GraphQL data.
export class VariableStore {
  private variableIdCounter = 0
  private variableNameCounter = new NameCounter()
  private variables: { [name: string]: Variable } = {}

  constructor(private cb: AddVariableCallback) {}

  // Get or create a variable.
  public getVariable(value: any): IVariableReference {
    for (let variableName in this.variables) {
      if (!this.variables.hasOwnProperty(variableName)) {
        continue
      }
      let variable = this.variables[variableName]
      if (variable.value === value) {
        return variable.addReference()
      }
    }

    let nvar = new Variable(this.variableIdCounter++, this.variableNameCounter.increment(), value)
    this.variables[nvar.name] = nvar
    this.cb(nvar)
    return nvar.addReference()
  }

  public getVariableByName(name: string): IVariableReference | null {
    let variable = this.variables[name]
    if (!variable) {
      return null
    }
    return variable.addReference()
  }

  public forEach(cb: (vb: Variable) => void) {
    for (let variableName in this.variables) {
      if (!this.variables.hasOwnProperty(variableName)) {
        continue
      }
      cb(this.variables[variableName])
    }
  }

  // Remove unreferenced variables
  public garbageCollect() {
    for (let variableName of Object.keys(this.variables)) {
      let variable = this.variables[variableName]
      if (!variable.hasReferences) {
        variable.removed = true
        delete this.variables[variableName]
      }
    }
  }
}
