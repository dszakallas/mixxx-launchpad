import { EventEmitter } from 'eventemitter3'

export default class Component extends EventEmitter {
  constructor ({ onMount, onUnmount } = { }) {
    super()
    this._mountHandler = onMount || this.onMount
    this._unmountHandler = onUnmount || this.onUnmount
    this.target = null
  }

  mount (state) {
    if (!this.target) {
      this.target = state
      this.emit(`mount`, this._mountHandler())
    }
  }

  unmount () {
    if (this.target) {
      this.emit(`unmount`, this._unmountHandler())
      this.target = null
    }
  }

  onMount () { }

  onUnmount () { }
}
