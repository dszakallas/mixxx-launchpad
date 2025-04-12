import { MidiControlDef } from '@mixxx-launch/common/midi'
import { RGBColor } from '@mixxx-launch/common/color'
import { MidiDevice, sendShortMsg } from '@mixxx-launch/mixxx'

export enum Color {
  Black = 0,
  RedHi,
  RedLow,
  GreenLow,
  GreenHi,
  AmberLow,
  AmberHi,
  OrangeHi,
  OrangeLow,
  YellowHi,
  YellowLow,
}

export abstract class LaunchDevice extends MidiDevice {
  abstract colors: { [key in Color]: number }

  abstract supportsRGBColors: boolean

  sendColor(control: MidiControlDef, value: Color): void {
    sendShortMsg(control, this.colors[value])
  }

  clearColor(control: MidiControlDef): void {
    sendShortMsg(control, this.colors[Color.Black])
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
