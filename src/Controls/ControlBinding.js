import { Component } from '../Component'
import { Control } from '../Mixxx'

export class ControlBinding extends Component {
  static create (id, control) {
    return new ControlBinding(id, control)
  }
  constructor (id, control) {
    super()
    this.value = null
    this.id = id
    this.control = control
    this._handle = null
  }

  onMount () {
    if (!this._handle) {
      this.controlBus = this.target
      this._handle = this.controlBus.connect(this.id, this.control, (data) => {
        this.value = data.value
        this.emit('update', data)
      })
      this.value = Control.getValue(this.control)
      this.emit('update', this)
      return this
    }
  }

  onUnmount () {
    if (this._handle) {
      this.controlBus.disconnect(this._handle)
      this._handle = null
    }
  }

  setValue (value) {
    Control.setValue(this.control, value)
    this.value = Control.getValue(this.control)
  }

  toggleValue (value) {
    this.setValue(Number(!this.getValue()))
  }

  getValue () {
    if (!this.handle) {
      this.value = Control.getValue(this.control)
    }
    return this.value
  }
}
