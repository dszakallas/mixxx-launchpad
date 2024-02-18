import { physicalControls } from '../controls'
import { sendShortMsg, sendSysexMsg } from '@mixxx-launch/mixxx'
import { useDevice, LaunchControlDevice, ControllerControlDef } from '@mixxx-launch/launchcontrol-common'
import { range } from '@mixxx-launch/common'
import { PhysicalMidiControlDef, toMidiControlDef } from '@mixxx-launch/launchcontrol-common/src/device'

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

const convertControlDef = (name: string, [opcode, midino]: ControllerControlDef): PhysicalMidiControlDef => ({
  name,
  opcode,
  midino,
})

class LaunchControlXLMK2Device extends LaunchControlDevice {
  physicalControls: { [key: string]: PhysicalMidiControlDef }
  colors: { [key: string]: number }
  leds: { [key: string]: number }
  numTemplates = 16

  constructor() {
    super()
    this.physicalControls = Object.fromEntries(
      physicalControls.map(([k, v]) => [k, convertControlDef(k as string, v as [number, number])]),
    )
    console.log(JSON.stringify(physicalControls))
    console.log(JSON.stringify(this.physicalControls))
    this.leds = leds
    this.colors = colors
  }

  sendColor(template: number, ledIndex: number, color: number): void {
    sendSysexMsg([...colorChangeSysexPreamble, template, ledIndex, color, 247])
  }

  resetTemplate(template: number): void {
    sendShortMsg(toMidiControlDef(this.physicalControls['reset'], template), 0)
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
