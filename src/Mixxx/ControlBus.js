import { engine } from './globals'

const moduleName = require('../../package.json').mixxx.moduleName
const callbackPrefix = '__mixxx_ctrl'

export class ControlBus {
  static create (registry) {
    return new ControlBus(moduleName, registry)
  }

  constructor (registryName, registry) {
    this._registryName = registryName
    this._registry = registry
    this._callbackList = { }
  }

  connect (id, control, cb) {
    const { group, name } = control
    const key = `${group.slice(1, -1)}_${name}`
    const engineCb = `${callbackPrefix}_${key}`

    if (!this._callbackList[key]) {
      this._callbackList[key] = { }
    }
    this._callbackList[key][id] = cb

    if (!this._registry[engineCb]) {
      this._registry[engineCb] = (value) => {
        for (const id in this._callbackList[key]) {
          this._callbackList[key][id]({ value, control, id, controlBus: this })
        }
      }
      engine.connectControl(group, name, `${this._registryName}.${engineCb}`)
    }
    return { id, group, name }
  }

  disconnect (handle) {
    const { id, group, name } = handle
    const key = `${group.slice(1, -1)}_${name}`
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
