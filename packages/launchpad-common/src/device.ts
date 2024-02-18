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
  abstract controls: { [key: string]: MidiControlDef }
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

    Object.values(this.controls).forEach((c) => {
      this.registerControl(c, (_channel, control, value, _status) => {
        const message = { value, control }
        this.emit(c.name, message)
      })
    })
  }

  onUnmount() {
    super.onUnmount()
  }
}

export class MidiComponent extends mixxxMidiComponent<LaunchpadDevice> {
  onUnmount() {
    // TODO: find better place for clearing color on onMount
    this._device.clearColor(this.control)
    super.onUnmount()
  }
}
