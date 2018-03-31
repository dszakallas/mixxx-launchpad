/* @flow */
import { engine } from './globals'

const timerPrefix = '__timer'

type TimerState = {
  handle: ?number,
  key: ?string,
  started: ?number
}

export class Timer {
  task: () => void

  _state: ?TimerState

  _registryName: string
  _registry: Object

  constructor (registryName: string, registry: Object, task: () => void) {
    this._registryName = registryName
    this._registry = registry
    this.task = task
    this._state = undefined
  }

  start (interval: number) {
    if (this._state == null) {
      const started = Date.now()
      const key = `${timerPrefix}_${started}_${parseInt(Math.random() * 100)}`
      const handle = engine.beginTimer(interval, `${this._registryName}.${key}`)
      this._state = { handle, key, started }
      this._registry[key] = this.task
      return started
    }
  }

  end () {
    const state = this._state
    if (state != null) {
      engine.stopTimer(state.handle)
      delete this._registry[state.key]
      this._state = undefined
    }
  }

  restart (interval: number) {
    if (this._state != null) {
      this.end()
      return this.start(interval)
    }
  }

  getStartTime () {
    return this._state && this._state.started
  }
}

export type TimerBuilder = (() => void) => Timer

export const makeTimer = (moduleName: string, registry: Object): TimerBuilder =>
  (task: () => void) => {
    return new Timer(moduleName, registry, task)
  }
