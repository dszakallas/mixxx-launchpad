import { range, array, map, forEach } from '@mixxx-launch/common'
import { channelControlDefs, setValue, Component, ControlComponent, MidiComponent, MidiControlDef, MidiDevice, MidiMessage, absoluteNonLin, sendShortMsg, sendSysexMsg } from "@mixxx-launch/mixxx"
import { createEffectDef, createEffectParameterDef, createEffectRackDef, createEffectUnitDef, EffectKey, EffectUnitKey, numDecks, numEqualizerRacks } from "@mixxx-launch/mixxx/src/Control"

export enum Eq3Channel {
  Low,
  Mid,
  High,
}

export const equalizerRackDefs = array(map((i: number) => createEffectRackDef(`EqualizerRack${i + 1}`), range(numEqualizerRacks)))

export const equalizerUnitDefs = array(map((i: number) => {
  return array(map((j: number) => createEffectUnitDef(`EqualizerRack${i + 1}`, `[Channel${j + 1}]`), range(numDecks)))
}, range(numEqualizerRacks)))

export const numEqualizerEffects = 1 as const
export const equalizerEffectDefs = array(map((i: number) => {
  return array(map((j: number) => {
    return array(map((k: number) => {
      return createEffectDef(`EqualizerRack${i + 1}`, `[Channel${j + 1}]`, `Effect${k + 1}`)
    }, range(numEqualizerEffects)))
  }, range(numDecks)))
}, range(numEqualizerRacks)))

export const equalizerParamDefs = array(map((i: number) => {
  return array(map((j: number) => {
    return array(map((k: number) => {
      return array(map((l: number) => {
        return createEffectParameterDef(`EqualizerRack${i + 1}`, `[Channel${j + 1}]`, `Effect${k + 1}`, l + 1)
      }, range(3)))
    }, range(numEqualizerEffects)))
  }, range(numDecks)))
}, range(numEqualizerRacks)))


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

export const effectEssentials = (unit: number, col: number) => {
  return [
    [`knob.0.${col}`, { type: "effect_unit", params: { unit, parameter: 'super1', deck: 0 } }],
    [`knob.1.${col}`, { type: "effect", params: { unit, effect: 0, parameter: 'meta', deck: 0 } }],
    [`knob.2.${col}`, { type: "effect", params: { unit, effect: 1, parameter: 'meta', deck: 0 } }],
    [`fader.0.${col}`, { type: "effect_unit", params: { unit, parameter: 'dry_wet', deck: 0 } }],
    [`pad.0.${col}`, { type: "effect", params: { unit, effect: 0, parameter: 'enabled', deck: 0 } }],
    [`pad.1.${col}`, { type: "effect", params: { unit, effect: 1, parameter: 'enabled', deck: 0 } }],
  ] as const
}

const controlIndex = {
  'eq3': (channel: Eq3Channel, deck: number, parameter: 'value' | 'kill' = 'value') => {
    return parameter === 'value' ? equalizerParamDefs[0][deck][0][channel].value :
      equalizerParamDefs[0][deck][0][channel].button_value
  },
  'gain': (deck: number) => {
    return channelControlDefs[deck].volume
  },
  // 'effect_unit': (unit: number, parameter: EffectUnitKey) => {
  //   return channelControlDefs[0].effectUnits[unit][parameter]
  // },
  // 'effect': (unit: number, effect: number, parameter: EffectKey) => {
  //   return channelControlDefs[0].effectUnits[unit].effects[effect][parameter]
  // }
}

const sendColor = (template: number, index: number, color: number) => {
  sendSysexMsg([240, 0, 32, 41, 2, 17, 120, template, index, color, 247])
}

class App extends Component {
  _device: LaunchControlDevice

  children: Component[]

  constructor(device: LaunchControlDevice) {
    super()
    this._device = device

    this.children = []

    const colorMap = {
      [Eq3Channel.High]: this._device.colors.lo_red,
      [Eq3Channel.Mid]: this._device.colors.lo_yellow,
      [Eq3Channel.Low]: this._device.colors.lo_green,
    }

    forEach((col) => {
      const eqs = eq3(col, col)
      for (const [midi, cd] of eqs) {

        const control = controlIndex[cd.type](cd.params.channel, cd.params.deck, cd.params.parameter)

        const controlComponent = new ControlComponent(control, true)

        this.children.push(controlComponent)

        const midiControl = this._device.controls[`0.${midi}`]
        const midiControlLed = this._device.controls[`0.${midi.replace('knob', 'led')}`]

        const midiComponent = new MidiComponent(this._device, midiControl)

        midiComponent.addListener('midi', ({value}: MidiMessage) => {
          setValue(control, absoluteNonLin(value, 0, 1, 4))
        })

        midiComponent.addListener('mount', () => {
          sendShortMsg(midiControlLed, colorMap[cd.params.channel])
        })

        this.children.push(midiComponent)
      }

      const gains = gain(col, col)

      for (const [midi, cd] of gains) {
        const control = controlIndex[cd.type](cd.params.deck)

        const controlComponent = new ControlComponent(control, true)

        this.children.push(controlComponent)

        const midiControl = this._device.controls[`0.${midi}`]

        const midiComponent = new MidiComponent(this._device, midiControl)

        midiComponent.addListener('midi', ({value}: MidiMessage) => {
          setValue(control, value / 127)
        })

        this.children.push(midiComponent)
      }
    }, range(4))

    // range(4).forEach(i => {
    //   const col = i + 4
    //   const effect = effectEssentials(i, col)

    //   for (const [midi, cd] of effect) {
    //     const control = controlIndex[cd.type](cd.params.unit)
    //   })
    // })

  }

  onMount() {
    super.onMount()
    for (const child of this.children) {
      child.mount()
    }

    this._device.on('0.pad.0.0.on', ({ value, control: { status, midino, name } }: MidiMessage) => {
      console.log('handle', name, status, midino, value)
    })
    this._device.on('0.pad.0.0.off', ({ value, control: { status, midino, name } }: MidiMessage) => {
      console.log('handle', name, status, midino, value)
    })

  }

  onUnmount() {
    for (const child of this.children) {
      child.unmount()
    }
    super.onUnmount()
  }

}

export abstract class LaunchControlDevice extends MidiDevice {
  abstract colors: { [key: string]: number }
  abstract numTemplates: number
  sysex: boolean = true

  constructor() {
    super()
  }

  abstract resetTemplate(template: number): void

  abstract changeTemplate(template: number): void

  // tries to parse a sysex message and returns the template number if it was a template change message
  abstract handleTemplateChangeSysex(data: number[]): number | undefined

  handleSysex(data: number[]) {
    console.log('inbound sysex', data)
    const template = this.handleTemplateChangeSysex(data)
    if (template != null) {
      this.emit('template', template)
    }
  }

  onMount() {
    super.onMount()
    forEach(this.resetTemplate.bind(this), range(this.numTemplates))
    this.addListener('sysex', this.handleSysex.bind(this))
    this.changeTemplate(0)
  }

  onUnmount() {
    this.removeListener('sysex', this.handleSysex.bind(this));
    forEach(this.resetTemplate.bind(this), range(this.numTemplates))
    super.onUnmount()
  }
}


export type ControllerControlDef = [number, number];

export const convertControlDef = (name: string, [status, midino]: ControllerControlDef): MidiControlDef => ({ name, status, midino })

export const useDevice = (device: LaunchControlDevice) => {
  const app = new App(device)
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  device.addListener('template', (template: number) => {
    console.log('template', template)
  })
  return device
}

