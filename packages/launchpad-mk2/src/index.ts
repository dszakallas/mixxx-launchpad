import { convertControlDef, LaunchpadDevice, useDevice } from '@mixxx-launch/launchpad-common'
import def from '../controls'
import { sendSysexMsg } from '@mixxx-launch/mixxx'
import { MidiControlDef } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'
import { RGBColor } from '@mixxx-launch/common/color'

const colors = {
  [Color.Black]: 0,
  [Color.RedLow]: 7,
  [Color.RedHi]: 5,
  [Color.GreenLow]: 19,
  [Color.GreenHi]: 17,
  [Color.AmberLow]: 43,
  [Color.AmberHi]: 41,
  [Color.OrangeHi]: 84,
  [Color.OrangeLow]: 61,
  [Color.YellowHi]: 13,
  [Color.YellowLow]: 15,
}

class LaunchpadMK2Device extends LaunchpadDevice {
  supportsRGBColors: boolean
  controls: { [key: string]: MidiControlDef }
  colors: { [key in Color]: number }

  constructor() {
    super()
    this.controls = Object.fromEntries(
      Object.entries(def().controls).map(([k, v]) => [k, convertControlDef(k, v as [number, number])]),
    )
    this.colors = colors
    this.supportsRGBColors = true
  }

  override onMount() {
    super.onMount()
  }

  sendRGBColor(control: MidiControlDef, color: RGBColor) {
    sendSysexMsg([240, 0, 32, 41, 2, 24, 11, control.midino, ...color.map((x) => ~~(x / 4)), 247])
  }
}

export default useDevice(new LaunchpadMK2Device())
