import { channelControlDefs, setValue, Component, ControlComponent, MidiComponent, MidiControlDef, MidiDevice, MidiMessage, absoluteNonLin } from "@mixxx-launchpad/mixxx"
import { equalizerParamDefs } from "@mixxx-launchpad/mixxx/src/Control"
import { range } from "./util"

export enum Eq3Channel {
  Low = 0,
  Mid = 1,
  High = 2,
}

export const eq3 = (deck: number, col: number) => {
  return [
    [`knob.0.${col}`, { type: "eq3", params: { channel: Eq3Channel.High, deck: deck, parameter: 'value' } }],
    [`knob.1.${col}`, { type: "eq3", params: { channel: Eq3Channel.Mid, deck: deck, parameter: 'value' } }],
    [`knob.2.${col}`, { type: "eq3", params: { channel: Eq3Channel.Low, deck: deck, parameter: 'value' } }],
  ] as const
}

export const eq2kill = (deck: number, col: number) => {
  return [
    [`pad.0.${col}`, { type: "eq", params: { channel: Eq3Channel.High, parameter: 'kill', deck: deck } }],
    [`pad.1.${col}`, { type: "eq", params: { channel: Eq3Channel.Low, parameter: 'kill', deck: deck } }],
  ] as const
}

export const gain = (deck: number, col: number) => {
  return [
    [`fader.0.${col}`, { type: "gain", params: { deck: deck } }],
  ] as const
}

const controlIndex = {
  'eq3': (channel: Eq3Channel, deck: number, parameter: 'value' | 'kill' = 'value') => {
    return parameter === 'value' ? equalizerParamDefs[0][deck][0][channel].value :
      equalizerParamDefs[0][deck][0][channel].button_value
  }
}


class App extends Component {
  _device: MidiDevice

  children: Component[]

  constructor(device: MidiDevice) {
    super()
    this._device = device

    this.children = []

    range(4).forEach(col => {
      const eqs = eq3(col, col)
      for (const [midi, cd] of eqs) {

        const control = controlIndex[cd.type](cd.params.channel, cd.params.deck, cd.params.parameter)

        const controlComponent = new ControlComponent(control, true)

        this.children.push(controlComponent)

        const midiControl = this._device.controls[`0.${midi}`]

        const midiComponent = new MidiComponent(this._device, midiControl)

        midiComponent.addListener('midi', ({value}: MidiMessage) => {
          setValue(control, absoluteNonLin(value, 0, 1, 4))
        })

        this.children.push(midiComponent)
      }
    })

  }

  onMount() {
    for (const child of this.children) {
      child.mount()
    }
  }

  onUnmount() {
    for (const child of this.children) {
      child.unmount()
    }
  }

}

export abstract class LaunchControlDevice extends MidiDevice {
  abstract colors: { [key: string]: number }

  constructor() {
    super()
  }

  onMount() {
    super.onMount()
  }

  onUnmount() {
    super.onUnmount()
  }
}


export type ControllerControlDef = [number, number];

export const convertControlDef = (name: string, [status, midino]: ControllerControlDef): MidiControlDef => ({ name, status, midino })


export const useDevice = (device: LaunchControlDevice) => {
  const app = new App(device)
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  return device
}
