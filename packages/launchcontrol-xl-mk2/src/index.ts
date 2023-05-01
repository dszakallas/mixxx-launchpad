import def from '../controller.json'
import { MidiControlDef, sendShortMsg, sendSysexMsg } from '@mixxx-launch/mixxx'
import { convertControlDef, useDevice, LaunchControlDevice } from '@mixxx-launch/launchcontrol-common'
import { range } from '@mixxx-launch/common'

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

const templateChangeSysexPreamble = [240, 0, 32, 41, 2, 17, 119] as const
const colorChangeSysexPreamble = [240, 0, 32, 41, 2, 17, 120] as const

const sendColor = (template: number, index: number, color: number) => {
  sendSysexMsg([...colorChangeSysexPreamble, template, index, color, 247])
}

class LaunchControlXLMK2Device extends LaunchControlDevice {
  controls: { [key: string]: MidiControlDef }
  colors: { [key: string]: number }
  numTemplates = 16

  constructor() {
    super()
    this.controls = Object.fromEntries(
      Object
        .entries(def.controls)
        .map(([k, v]) => [k, convertControlDef(k, v as [number, number])]))
    this.colors = colors
  }

  resetTemplate(template: number): void {
    sendShortMsg(this.controls[`${template}.reset`], 0)
  }

  changeTemplate(template: number): void {
    sendSysexMsg([...templateChangeSysexPreamble, template, 247])
  }

  inboundSysex(data: number[]) {
    console.log('inbound sysex', data)
    if (data.length === 9 && templateChangeSysexPreamble[6] === data[6]) {
      this.emit('template', data[7])
    }
  }


  onMount() {
    super.onMount()
    range(this.numTemplates).forEach(this.resetTemplate.bind(this))
    console.log('changing template')
    this.changeTemplate(0)
  }

  onUnmount() {
    range(this.numTemplates).forEach(this.resetTemplate.bind(this))
    super.onUnmount()
  }
}


export default useDevice(new LaunchControlXLMK2Device())

