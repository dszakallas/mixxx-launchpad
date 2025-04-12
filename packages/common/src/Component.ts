import EventEmitter from 'eventemitter3'

export class Component extends EventEmitter {
  private _mounted: boolean = false

  constructor() {
    super()
  }

  /**
   * Whether the component is mounted.
   *
   * @readonly
   * @type {boolean}
   */
  get mounted() {
    return this._mounted
  }

  /**
   * Mount the component. Call only if the component is not mounted.
   */
  mount() {
    this.onMount()
    this._mounted = true
    this.emit('mount', this)
  }

  /**
   * Unmount the component. Call only if the component is mounted.
   */
  unmount() {
    this.onUnmount()
    this._mounted = false
    this.emit('unmount', this)
  }

  /**
   * Called when the component is mounted. You should override in subclasses
   * to add your own logic.
   */
  protected onMount() {}

  /**
   * Called when the component is unmounted. You should override in subclasses
   * to add your own logic.
   */
  protected onUnmount() {}
}

export class Container extends Component {
  private children: Component[]

  constructor(children: Component[]) {
    super()
    this.children = children
  }

  override onMount() {
    super.onMount()
    for (const child of this.children) {
      child.mount()
    }
  }

  override onUnmount() {
    for (let i = this.children.length - 1; i >= 0; i--) {
      this.children[i].unmount()
    }
    super.onUnmount()
  }
}
