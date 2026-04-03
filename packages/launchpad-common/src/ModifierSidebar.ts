import type { MidiMessage } from '@mixxx-launch/common/midi'
import { Component } from '@mixxx-launch/common/component'
import { LaunchpadDevice, Pad } from './device'
import { ModifierState, Modifier } from '@mixxx-launch/common/modifier'
import type { ColorPalette } from '@mixxx-launch/common'

export default class ModifierSidebar extends Component implements Modifier {
  shift: Pad
  ctrl: Pad
  state: ModifierState
  shiftListener: (_: MidiMessage) => void
  ctrlListener: (_: MidiMessage) => void
  colorPalette: ColorPalette

  constructor(device: LaunchpadDevice, colorPalette: ColorPalette) {
    super()
    this.shift = new Pad(device, device.controls.solo)
    this.ctrl = new Pad(device, device.controls.arm)
    this.colorPalette = colorPalette

    this.state = ModifierState.None

    const makeListener = (button: Pad) => (message: MidiMessage) => {
      const { value } = message
      if (value) {
        button.sendPaletteColor(this.colorPalette.getColor(0, 1))
      } else {
        button.clearColor()
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
