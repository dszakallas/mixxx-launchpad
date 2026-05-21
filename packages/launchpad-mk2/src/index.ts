import { convertControlDef, LaunchpadDevice, useDevice } from '@mixxx-launch/launchpad-common'
import def from '../controls'
import { sendSysexMsg } from '@mixxx-launch/mixxx'
import { MidiControlDef } from '@mixxx-launch/common/midi'
import { RGBColor } from '@mixxx-launch/common/color'

class LaunchpadMK2Device extends LaunchpadDevice {
  supportsRGBColors: boolean
  controls: { [key: string]: MidiControlDef }
  colors: number[]

  constructor() {
    super()
    this.controls = Object.fromEntries(
      Object.entries(def().controls).map(([k, v]) => [k, convertControlDef(k, v as [number, number])]),
    )
    this.colors = [
      0, // Black
      7, // RedLow
      5, // RedHi
      19, // GreenLow
      17, // GreenHi
      43, // AmberLow
      41, // AmberHi
      84, // OrangeHi
      61, // OrangeLow
      13, // YellowHi
      15, // YellowLow
    ]
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
