import { PrimitiveValue, UnpackPrimitive } from '../primitive.js'
import { RGQLValue } from '../rgraphql.pb.js'
import { QueryMap, QueryMapElem } from './query-map.js'
import { QueryTreeNode } from './query-tree-node.js'
import { ResultTreeHandler } from './result-tree-handler.js'

// JSONDecoderHandler is a cursor pointing to part of the result.
export class JSONDecoderHandler {
  // value is the current selected value position
  public value?: PrimitiveValue
  // qnode is the attached query tree node.
  public qnode?: QueryTreeNode

  // applyValue applies at the previously selected position
  public applyValue?: (override: boolean, getVal: () => unknown) => PrimitiveValue
  // pendingValue is a pending previous value
  public pendingValue?: RGQLValue

  constructor(
    private queryMap: QueryMap | undefined,
    private valChangedCb: () => void,
  ) {}

  // handleValue is a ResultTreeHandler.
  public handleValue(val: RGQLValue | undefined): ResultTreeHandler {
    let nextHandler = new JSONDecoderHandler(this.queryMap, this.valChangedCb)

    if (val === undefined) {
      if (this.applyValue) {
        this.applyValue(true, () => {
          return undefined
        })
      }
      return null
    }

    if (val.queryNodeId) {
      if (!this.qnode) {
        return null
      }

      const childQnode = this.qnode.lookupChildByID(val.queryNodeId || 0)
      if (!childQnode) {
        return null
      }
      const childFieldName = childQnode.getName()
      let childResultFieldName = childFieldName

      let childQme: QueryMapElem | undefined
      if (this.queryMap) {
        childQme = this.queryMap[val.queryNodeId || 0]
        if (childQme) {
          if (childQme.alias && childQme.alias.length) {
            childResultFieldName = childQme.alias
          }
        }
      }

      if (!childQme) {
        return null
      }

      let nval: PrimitiveValue
      if (this.applyValue) {
        nval = this.applyValue(false, () => {
          return {}
        })
      } else {
        nval = this.value!
      }

      nextHandler.queryMap = childQme.selections
      nextHandler.applyValue = (overrideVal: boolean, getVal: () => unknown) => {
        if (overrideVal || !(childResultFieldName in nval)) {
          const nxval = getVal()
          if (nxval === undefined) {
            delete nval[childResultFieldName]
          } else {
            nval[childResultFieldName] = nxval
          }
          if (this.valChangedCb) {
            this.valChangedCb()
          }
          return nxval as PrimitiveValue
        }
        return nval[childResultFieldName] as PrimitiveValue
      }
      nextHandler.value = nval
      nextHandler.qnode = childQnode
    } else if (val.arrayIndex) {
      let nval: unknown[]
      if (this.applyValue) {
        nval = this.applyValue(false, () => {
          return []
        })
      } else {
        nval = this.value
      }

      const idx = (val.arrayIndex || 1) - 1
      nextHandler.qnode = this.qnode
      nextHandler.applyValue = (override: boolean, getVal: () => unknown) => {
        if (override || !(idx in nval)) {
          const nxval = getVal()
          if (nxval === undefined) {
            // TODO: investigate if this index is consistent.
            nval.splice(idx, 1)
          } else {
            nval[idx] = nxval
          }
          if (this.valChangedCb) {
            this.valChangedCb()
          }
          return nxval
        }
        return nval[idx]
      }
    } else {
      nextHandler = this // eslint-disable-line @typescript-eslint/no-this-alias
    }

    if (val.value) {
      if (nextHandler.applyValue) {
        const unpacked = UnpackPrimitive(val.value)
        nextHandler.applyValue(true, () => {
          return unpacked
        })
      } else {
        // cannot process w/o applyValue function
        return null
      }
    }

    return nextHandler.handleValue.bind(nextHandler)
  }
}
