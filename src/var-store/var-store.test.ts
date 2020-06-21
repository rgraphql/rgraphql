import { VariableStore, Variable } from './var-store'

describe('QueryTreeNode', () => {
  let store: VariableStore

  beforeEach(() => {
    store = new VariableStore((vb: Variable) => {
      //
    })
  })

  it('should add a variable properly', () => {
    let vari = store.getVariable('test')
    expect(vari.name).toEqual('B')
    let varb = store.getVariable('test2')
    expect(varb.name).toEqual('C')
    let varc = store.getVariable('test')
    expect(varc.name).toEqual('B')
    let vard = store.getVariable(true)
    expect(vard.name).toEqual('D')
  })
})
