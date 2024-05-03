import { describe, it, expect, beforeEach } from 'vitest'
import { VariableStore } from './var-store.js'

describe('VariableStore', () => {
  let store: VariableStore

  beforeEach(() => {
    store = new VariableStore(null)
  })

  it('should get variables properly', () => {
    const vari = store.getVariable('test')
    expect(vari.name).toEqual('B')
    const varb = store.getVariable('test2')
    expect(varb.name).toEqual('C')
    const varc = store.getVariable('test')
    expect(varc.name).toEqual('B')
    const vard = store.getVariable(true)
    expect(vard.name).toEqual('D')
  })
})
