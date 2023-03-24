import def from '../controller.json'
import { MidiControlDef, MidiMessage, sendShortMsg, sendSysexMsg } from '@mixxx-launchpad/mixxx'
import { useDevice, LaunchControlDevice } from '@mixxx-launchpad/control-app'

const colors = {
  //black: 12,
  lo_red: 13,
  hi_red: 15,
  lo_orange: 30,
  hi_orange: 47,
  lo_amber: 29,
  hi_amber: 63,
  lo_yellow: 45,
  hi_yellow: 62,
  lo_green: 28,
  hi_green: 60,
}

const sendColor = (template: number, index: number, color: number) => {
  sendSysexMsg([240, 0, 32, 41, 2, 17, 120, template, index, color, 247])
}
const resetTemplate = (template: number) => {
  sendShortMsg({name: 'name', status: 176 + template, midino: 0}, 0)
}

class LaunchControlXLMK2Device extends LaunchControlDevice {
  controls: { [key: string]: MidiControlDef }
  colors: { [key: string]: number }

  constructor() {
    super()
    this.controls = def.controls
    this.colors = colors
  }

  onMount() {
    const colorKeys = Object.keys(colors);
    this.addListener('attack', (mm: MidiMessage) => {

    })
    for(let i = 0; i < 16; ++i) {
      resetTemplate(i)
      for(let j = 0; j < 2; ++j) {  
        sendColor(i, 24 + j, colors[colorKeys[(i % 5) * 2 + j]]);
      }
      for (let j = 2; j < 18; ++j) {
        sendColor(i, 24 + j, 12);
      }
    }
    super.onMount()
  }
}

export default useDevice(new LaunchControlXLMK2Device())
