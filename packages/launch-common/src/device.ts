import { MidiControlDef } from '@mixxx-launch/common/midi'
import { RGBColor } from '@mixxx-launch/common/color'
import { MidiDevice, sendShortMsg } from '@mixxx-launch/mixxx'

export abstract class LaunchDevice extends MidiDevice {
  // Indexed colors supported by the device
  // Index 0 is always black
  // The rest are in pairs of (low, high) brightness
  // It is sufficient to only specify black, and use RGB for all other colors
  abstract colors: number[]

  abstract supportsRGBColors: boolean

  sendColor(control: MidiControlDef, value: number): void {
    sendShortMsg(control, this.colors[value])
  }

  clearColor(control: MidiControlDef): void {
    sendShortMsg(control, this.colors[0])
  }

  abstract sendRGBColor(control: MidiControlDef, value: RGBColor): void

  constructor() {
    super()
  }

  override onMount() {
    super.onMount()
  }

  override onUnmount() {
    super.onUnmount()
  }
}
