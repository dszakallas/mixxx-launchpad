import { Component } from '../Component'

export class ButtonBinding extends Component {
  static create (button) {
    return new ButtonBinding(button)
  }
  constructor (button) {
    super()
    this.launchpadBus = null
    this.button = button
    this._cb = (data) => {
      if (data.value) {
        this.emit('attack', data)
      } else {
        this.emit('release', data)
      }
      this.emit('midi', data)
    }
  }

  onMount () {
    this.launchpadBus = this.target
    this.launchpadBus.on(this.button.toString(), this._cb)
    return this
  }

  onUnmount () {
    this.launchpadBus.removeListener(this.button.toString(), this._cb)
    this.launchpadBus = null
    return this
  }
}
