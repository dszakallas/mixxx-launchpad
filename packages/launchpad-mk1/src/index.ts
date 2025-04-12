import { convertControlDef, LaunchpadDevice, useDevice } from '@mixxx-launch/launchpad-common'
import def from '../controls'
import { MidiControlDef } from '@mixxx-launch/common/midi'
import { RGBColor } from '@mixxx-launch/common/color'
import { Color } from '@mixxx-launch/launch-common'

const colors = {
  [Color.Black]: 4,
  [Color.RedLow]: 1 + 4,
  [Color.RedHi]: 3 + 4,
  [Color.GreenLow]: 16 + 4,
  [Color.GreenHi]: 48 + 4,
  [Color.AmberLow]: 17 + 4,
  [Color.AmberHi]: 51 + 4,
  [Color.OrangeHi]: 35 + 4,
  [Color.OrangeLow]: 18 + 4,
  [Color.YellowHi]: 50 + 4,
  [Color.YellowLow]: 33 + 4,
}

class LaunchpadMK1Device extends LaunchpadDevice {
  supportsRGBColors: boolean
  controls: { [key: string]: MidiControlDef }
  colors: { [key in Color]: number }

  constructor() {
    super()
    this.controls = Object.fromEntries(
      Object.entries(def().controls).map(([k, v]) => [k, convertControlDef(k, v as [number, number])]),
    )
    this.colors = colors
    this.supportsRGBColors = false
  }

  sendRGBColor(_control: MidiControlDef, _value: RGBColor): void {
    throw new Error('Device does not support RGB Colors.')
  }
}

export default useDevice(new LaunchpadMK1Device())
