import { MidiControlDef, MidiDevice, sendShortMsg, MidiComponent as mixxxMidiComponent } from '@mixxx-launch/mixxx'
import { RGBColor } from './color'

export abstract class LaunchpadDevice extends MidiDevice {
  abstract colors: { [key: string]: number }

  abstract supportsRGBColors: boolean

  sendColor(control: MidiControlDef, value: number): void {
    sendShortMsg(control, value)
  }
  clearColor(control: MidiControlDef): void {
    sendShortMsg(control, this.colors.black)
  }

  abstract sendRGBColor(control: MidiControlDef, value: RGBColor): void

  constructor() {
    super()
  }

  onMount() {
    super.onMount()
  }

  onUnmount() {
    super.onUnmount()
  }
}

export class MidiComponent extends mixxxMidiComponent<LaunchpadDevice> {}
