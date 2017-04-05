/* @flow */
import { engine } from './globals'

import type { ControlDef } from './Control'

const callbackPrefix = '__ctrl'

const sanitize = (name: string) => {
  return name.replace('.', '$dot$').replace('[', '$sbs$').replace(']', '$sbe$')
}

type ControlBusHandle = {
  id: string,
  group: string,
  name: string,
  key: string
}

export type ControlMessage = {
  id: string,
  value: number,
  control: ControlDef
}

export class ControlBus {
  _registryName: string
  _registry: Object
  _callbackList: Object

  static create (moduleName: string, registry: Object) {
    return new ControlBus(moduleName, registry)
  }

  constructor (registryName: string, registry: Object) {
    this._registryName = registryName
    this._registry = registry
    this._callbackList = { }
  }

  connect (id: string, control: ControlDef, cb: any): ControlBusHandle {
    const { group, name } = control
    const key = `${sanitize(group)}_${sanitize(name)}`
    const engineCb = `${callbackPrefix}_${key}`

    if (!this._callbackList[key]) {
      this._callbackList[key] = { }
    }
    this._callbackList[key][id] = cb

    if (!this._registry[engineCb]) {
      this._registry[engineCb] = (value) => {
        for (const id in this._callbackList[key]) {
          this._callbackList[key][id]({ value, control, id })
        }
      }
      engine.connectControl(group, name, `${this._registryName}.${engineCb}`)
    }
    return { id, group, name, key }
  }

  disconnect (handle: ControlBusHandle) {
    const { id, group, name, key } = handle
    const engineCb = `${callbackPrefix}_${key}`

    if (this._callbackList[key] && this._callbackList[key][id]) {
      delete this._callbackList[key][id]
    }

    if (!Object.keys(this._callbackList[key]).length && this._registry[engineCb]) {
      engine.connectControl(group, name, `${this._registryName}.${engineCb}`, true)
      delete this._callbackList[key]
      delete this._registry[engineCb]
    }
  }
}
