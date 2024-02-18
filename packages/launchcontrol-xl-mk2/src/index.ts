import def from '../controls'
import { MidiControlDef, sendShortMsg, sendSysexMsg } from '@mixxx-launch/mixxx'
import { convertControlDef, useDevice, LaunchControlDevice } from '@mixxx-launch/launchcontrol-common'
import { range } from '@mixxx-launch/common'

const colors = {
  black: 12,
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

const leds = Object.assign(
  {},
  Object.fromEntries([
    ...(function* () {
      for (const r of range(3)) {
        for (const c of range(8)) {
          yield [`knob.${r}.${c}`, r * 8 + c]
        }
      }
    })(),
  ]),
  Object.fromEntries([
    ...(function* () {
      for (const r of range(3)) {
        for (const c of range(8)) {
          yield [`pad.${r}.${c}`, r * 8 + c + 24]
        }
      }
    })(),
  ]),
  {
    device: 0x28,
    mute: 0x29,
    solo: 0x2a,
    arm: 0x2b,
    up: 0x2c,
    down: 0x2d,
    left: 0x2e,
    right: 0x2f,
  },
)

const templateChangeSysexPreamble = [240, 0, 32, 41, 2, 17, 119] as const
const colorChangeSysexPreamble = [240, 0, 32, 41, 2, 17, 120] as const

class LaunchControlXLMK2Device extends LaunchControlDevice {
  controls: { [key: string]: MidiControlDef }
  colors: { [key: string]: number }
  leds: { [key: string]: number }
  numTemplates = 16

  constructor() {
    super()
    this.controls = Object.fromEntries(
      Object.entries(def().controls).map(([k, v]) => [k, convertControlDef(k, v as [number, number])]),
    )
    this.leds = leds
    this.colors = colors
  }

  sendColor(template: number, ledIndex: number, color: number): void {
    sendSysexMsg([...colorChangeSysexPreamble, template, ledIndex, color, 247])
  }

  resetTemplate(template: number): void {
    sendShortMsg(this.controls[`${template}.reset`], 0)
  }

  changeTemplate(template: number): void {
    sendSysexMsg([...templateChangeSysexPreamble, template, 247])
  }

  handleTemplateChangeSysex(data: number[]): number | undefined {
    if (data.length === 9 && templateChangeSysexPreamble[6] === data[6]) {
      return data[7]
    }
  }
}

export default useDevice(new LaunchControlXLMK2Device())
