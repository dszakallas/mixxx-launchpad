import EventEmitter from 'eventemitter3'

export default class Component extends EventEmitter {
  mount () {
    this.onMount()
    this.emit('mount', this)
  }

  unmount () {
    this.onUnmount()
    this.emit('unmount', this)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onMount () { }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onUnmount () { }
}
