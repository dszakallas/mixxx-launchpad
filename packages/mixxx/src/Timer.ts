import Component from './Component'
import { Action } from './util'

type TimerState = {
  handle: number
  started: number
}

export class Timer extends Component {
  task: Action<void>
  _state: TimerState | null

  constructor(task: Action<void>) {
    super()
    this.task = task
    this._state = null
  }

  start(interval: number): number {
    if (this._state == null) {
      const started = Date.now()
      const handle = engine.beginTimer(interval, this.task)
      this._state = { handle, started }
      return started
    }
    return this._state.started
  }

  end() {
    const state = this._state
    if (state != null) {
      engine.stopTimer(state.handle)
      this._state = null
    }
  }

  onUnmount() {
    this.end()
    super.onUnmount()
  }

  restart(interval: number): number {
    if (this._state != null) {
      this.end()
    }
    return this.start(interval)
  }
}
