import { convertControlDef, LaunchpadDevice, useDevice } from '@mixxx-launch/launchpad-common'
import def from '../controls'
import { MidiControlDef } from '@mixxx-launch/common/midi'
import { RGBColor } from '@mixxx-launch/common/color'

class LaunchpadMK1Device extends LaunchpadDevice {
  supportsRGBColors: boolean
  controls: { [key: string]: MidiControlDef }
  colors: number[]

  constructor() {
    super()
    this.controls = Object.fromEntries(
      Object.entries(def().controls).map(([k, v]) => [k, convertControlDef(k, v as [number, number])]),
    )
    this.colors = [
      4, // Black
      1 + 4, // RedLow
      3 + 4, // RedHi
      16 + 4, // GreenLow
      48 + 4, // GreenHi
      17 + 4, // AmberLow
      51 + 4, // AmberHi
      35 + 4, // OrangeHi
      18 + 4, // OrangeLow
      50 + 4, // YellowHi
      33 + 4, // YellowLow
    ]
    this.supportsRGBColors = false
  }

  sendRGBColor(_control: MidiControlDef, _value: RGBColor): void {
    throw new Error('Device does not support RGB Colors.')
  }
}

export default useDevice(new LaunchpadMK1Device())
