import EventEmitter from 'eventemitter3'

export class Component extends EventEmitter {
  mounted: boolean = false

  constructor() {
    super()
  }

  mount() {
    this.onMount()
    this.emit('mount', this)
    this.mounted = true
  }

  unmount() {
    this.onUnmount()
    this.emit('unmount', this)
    this.mounted = false
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onMount() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onUnmount() {}
}
