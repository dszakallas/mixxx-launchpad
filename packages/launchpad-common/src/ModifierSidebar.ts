import type { MidiMessage } from '@mixxx-launch/common/midi'
import { Component } from '@mixxx-launch/common/component'
import { LaunchpadDevice, MidiComponent } from './device'
import { ModifierState, Modifier } from '@mixxx-launch/common/modifier'

export default class ModifierSidebar extends Component implements Modifier {
  shift: MidiComponent
  ctrl: MidiComponent
  state: ModifierState
  shiftListener: (_: MidiMessage) => void
  ctrlListener: (_: MidiMessage) => void

  constructor(device: LaunchpadDevice) {
    super()
    this.shift = new MidiComponent(device, device.controls.solo)
    this.ctrl = new MidiComponent(device, device.controls.arm)

    this.state = ModifierState.None

    const makeListener = (button: MidiComponent) => (message: MidiMessage) => {
      const { value } = message
      if (value) {
        device.sendColor(button.control, device.colors.hi_red)
      } else {
        device.clearColor(button.control)
      }

      if (button.control.name === device.controls.solo.name) {
        this.state ^= ModifierState.Shift
        this.emit('update', this.state)
      } else {
        this.state ^= ModifierState.Ctrl
        this.emit('update', this.state)
      }
    }
    this.shiftListener = makeListener(this.shift)
    this.ctrlListener = makeListener(this.ctrl)
  }

  override onMount() {
    this.shift.mount()
    this.ctrl.mount()

    this.shift.on('midi', this.shiftListener)
    this.ctrl.on('midi', this.ctrlListener)
  }

  override onUnmount() {
    this.shift.removeListener('midi', this.shiftListener)
    this.ctrl.removeListener('midi', this.ctrlListener)

    this.shift.unmount()
    this.ctrl.unmount()
  }

  getState() {
    return this.state
  }
}
