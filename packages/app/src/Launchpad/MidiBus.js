import { EventEmitter } from 'eventemitter3'

import buttons from '@mixxx-launchpad/mk-specs/buttons'

const callbackPrefix = '__lp'

export class MidiBus extends EventEmitter {

  static create (registry) {
    return new MidiBus(registry)
  }

  constructor (registry) {
    super()
    this.registry = registry
    this._plugins = {
      press: {},
      release: {}
    }
    this._callbackList = { }

    Object.keys(buttons).forEach((buttonName) => {
      const button = buttons[buttonName]
      this.registry[`${callbackPrefix}_${button[0]}_${button[1]}`] = (channel, control, value, status, group) => {
        console.log('received', channel, control, value, status, group)
        const preprocessed = value
          ? Object.keys(this._plugins.press).reduce(
            ({ value, button, context }, pluginName) => this._plugins.press[pluginName](value, button, context),
            { value, button, context: {} })
          : Object.keys(this._plugins.release).reduce(
            ({ button, context }, pluginName) => this._plugins.release[pluginName](button, context),
            { button, context: {} })
        this.emit(button.toString(), { value: preprocessed.value || 0, button: preprocessed.button, context: preprocessed.context, bus: this })
      }
    })
  }

  addPlugin (id, plugin) {
    if (typeof plugin === 'function') {
      this._plugins.press[id] = plugin
    } else {
      if (plugin.press) {
        this._plugins.press[id] = plugin.press
      }
      if (plugin.release) {
        this._plugins.release[id] = plugin.release
      }
    }
  }

  removePlugin (id) {
    delete this._plugins.press[id]
    delete this._plugins.release[id]
  }
}
