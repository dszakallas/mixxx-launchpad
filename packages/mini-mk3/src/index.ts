import { LaunchpadDevice, useDevice } from '@mixxx-launchpad/app'
import def from '../controller.json'
import { MidiControlDef } from '@mixxx-launchpad/mixxx'

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
  controls: { [key: string]: MidiControlDef }
  colors: { [key: string]: number }

  constructor() {
    super()
    this.controls = def.controls
    this.colors = colors
  }
}

export default useDevice(new LaunchpadMiniMK3Device())
