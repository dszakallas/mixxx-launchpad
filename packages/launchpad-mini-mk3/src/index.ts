import { convertControlDef, LaunchpadDevice, useDevice } from '@mixxx-launch/launchpad-common'
import def from '../controls'
import { MidiControlDef } from '@mixxx-launch/common/midi'
import { sendSysexMsg } from '@mixxx-launch/mixxx'
import { RGBColor } from '@mixxx-launch/common/color'

enum DeviceMode {
  Live,
  Programmer,
}

enum LightingType {
  Static,
  Flash,
  Pulse,
  RGB,
}

const selectMode = (mode: DeviceMode) => {
  sendSysexMsg([240, 0, 32, 41, 2, 13, 14, mode, 247])
}

class LaunchpadMiniMK3Device extends LaunchpadDevice {
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
    selectMode(DeviceMode.Programmer)
    super.onMount()
  }

  sendRGBColor(control: MidiControlDef, color: RGBColor) {
    sendSysexMsg([240, 0, 32, 41, 2, 13, 3, LightingType.RGB, control.midino, ...color.map((x) => ~~(x / 2)), 247])
  }
}

export default useDevice(new LaunchpadMiniMK3Device())
