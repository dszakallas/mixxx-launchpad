import { engine } from './globals'

const timerPrefix = '__mixxx_timer'

export class Timer {
  static create (moduleName, registry) {
    return function (task, interval) {
      return new Timer(moduleName, registry, task, interval)
    }
  }

  constructor (registryName, registry, task, interval) {
    this._registryName = registryName
    this._registry = registry
    this._handle = undefined
    this._key = undefined
    this._started = undefined
    this.task = task
    this._interval = interval
  }

  start (interval) {
    if (this._handle == null) {
      if (interval != null) {
        this._interval = interval
      }
      this._started = Date.now()
      this._key = `${timerPrefix}_${this._started}_${parseInt(Math.random() * 100)}`
      this._registry[this._key] = this.task
      this._handle = engine.beginTimer(this._interval, `${this._registryName}.${this._key}`)
      return this._started
    }
  }

  end () {
    if (this._handle != null) {
      engine.stopTimer(this._handle)
      delete this._registry[this._key]
      this._key = undefined
      this._started = undefined
      this._handle = undefined
    }
  }

  restart (interval) {
    if (this._handle != null) {
      this.end()
      return this.start(interval)
    }
  }

  getStartTime () {
    return this._started
  }
}
