import { MidiControlDef, MidiDevice, sendShortMsg, MidiComponent as mixxxMidiComponent } from '@mixxx-launch/mixxx'

export type RGBColor = [number, number, number]

export const parseRGBColor = (number: number): RGBColor | null => {
  if (number === -1) {
    return null
  }
  const blue = number % 256
  const green = (number >> 8) % 256
  const red = (number >> 16) % 256
  return [red, green, blue]
}


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
