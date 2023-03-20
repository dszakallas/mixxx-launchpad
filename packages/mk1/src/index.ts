import { LaunchpadDevice, RGBColor, useDevice } from '@mixxx-launchpad/app'
import def from '../controller.json'
import { MidiControlDef } from '@mixxx-launchpad/mixxx'

const colors = {
  black: 4,
  lo_red: 1 + 4,
  hi_red: 3 + 4,
  lo_green: 16 + 4,
  hi_green: 48 + 4,
  lo_amber: 17 + 4,
  hi_amber: 51 + 4,
  hi_orange: 35 + 4,
  lo_orange: 18 + 4,
  hi_yellow: 50 + 4,
  lo_yellow: 33 + 4
}

class LaunchpadMK1Device extends LaunchpadDevice {
  supportsRGBColors: boolean
  controls: { [key: string]: MidiControlDef }
  colors: { [key: string]: number }

  constructor () {
    super()
    this.controls = def.controls
    this.colors = colors
    this.supportsRGBColors = false
  }

  sendRGBColor(_control: MidiControlDef, _value: RGBColor): void {
    throw new Error('Device does not support RGB Colors.')
  }
}

export default useDevice(new LaunchpadMK1Device())
