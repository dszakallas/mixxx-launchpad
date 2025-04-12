import { MidiControlDef } from '@mixxx-launch/common/midi'
import { RGBColor } from '@mixxx-launch/common/color'
import { MidiComponent } from '@mixxx-launch/mixxx'
import { LaunchDevice } from './device'

export class Pad<D extends LaunchDevice> extends MidiComponent<D> {
  constructor(device: D, control: MidiControlDef) {
    super(device, control)
  }

  sendColor(color: number) {
    this._device.sendColor(this.control, color)
  }

  clearColor() {
    this._device.clearColor(this.control)
  }

  get supportsRGBColors() {
    return this._device.supportsRGBColors
  }

  sendRGBColor(color: RGBColor) {
    this._device.sendRGBColor(this.control, color)
  }

  override onUnmount() {
    super.onUnmount()
    this._device.clearColor(this.control)
  }
}
