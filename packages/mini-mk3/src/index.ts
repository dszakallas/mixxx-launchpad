import { LaunchpadDevice, RGBColor, useDevice } from '@mixxx-launchpad/app'
import def from '../controller.json'
import { MidiControlDef, sendSysexMsg } from '@mixxx-launchpad/mixxx'

const colors = {
  black: 0,

  lo_red: 7,
  hi_red: 5,
  lo_green: 19,
  hi_green: 17,
  lo_amber: 43,
  hi_amber: 41,
  hi_orange: 84,
  lo_orange: 61,
  hi_yellow: 13,
  lo_yellow: 15
}

class LaunchpadMiniMK3Device extends LaunchpadDevice {
  supportsRGBColors: boolean
  controls: { [key: string]: MidiControlDef }
  colors: { [key: string]: number }

  constructor() {
    super()
    this.controls = def.controls
    this.colors = colors
    this.supportsRGBColors = true
  }

  onMount() {
    super.onMount()
    Object.values(this.controls).forEach((v) => {
      this.sendRGBColor(v, [255, 255, 255])
    })
  }

  sendRGBColor(control: MidiControlDef, color: RGBColor) {
    sendSysexMsg([240, 0, 32, 41, 2, 24, 11, control.midino, ...color.map((x) => ~~(x / 4)), 247])
  }
}

export default useDevice(new LaunchpadMiniMK3Device())
