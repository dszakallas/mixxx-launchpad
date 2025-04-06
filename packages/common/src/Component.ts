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

export const makeContainer = (children: Component[]) => new Container(children)

export class Container extends Component {
  children: Component[]

  constructor(children: Component[]) {
    super()
    this.children = children
  }

  onMount() {
    super.onMount()
    for (const child of this.children) {
      child.mount()
    }
  }

  onUnmount() {
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].unmount()
    }
    super.onUnmount()
  }
}
