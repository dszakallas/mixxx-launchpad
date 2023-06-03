import { range, array, map, forEach } from '@mixxx-launch/common'
import { channelControlDefs, setValue, Component, ControlComponent, MidiComponent, MidiControlDef, MidiDevice, MidiMessage, absoluteNonLin, sendShortMsg, sendSysexMsg } from "@mixxx-launch/mixxx"
import { ControlMessage, createEffectDef, createEffectParameterDef, createEffectRackDef, createEffectUnitChannelDef, createEffectUnitDef, EffectDef, EffectKey, EffectParameterDef, EffectRackKey, EffectUnitKey, formatControlDef, getValue, numDecks as mixxxNumDecks, numEqualizerRacks, RackName } from "@mixxx-launch/mixxx/src/Control"

export enum Eq3Channel {
  Low,
  Mid,
  High,
}

export const equalizerRackDefs = array(map((i: number) => createEffectRackDef(`EqualizerRack${i + 1}`), range(numEqualizerRacks)))

export const equalizerUnitDefs = array(map((i: number) => {
  return array(map((j: number) => createEffectUnitDef(`EqualizerRack${i + 1}`, `[Channel${j + 1}]`), range(mixxxNumDecks)))
}, range(numEqualizerRacks)))

export const numEqualizerEffects = 1 as const
export const equalizerEffectDefs = array(map((i: number) => {
  return array(map((j: number) => {
    return array(map((k: number) => {
      return createEffectDef(`EqualizerRack${i + 1}`, `[Channel${j + 1}]`, `Effect${k + 1}`)
    }, range(numEqualizerEffects)))
  }, range(mixxxNumDecks)))
}, range(numEqualizerRacks)))

export const equalizerParamDefs = array(map((i: number) => {
  return array(map((j: number) => {
    return array(map((k: number) => {
      return array(map((l: number) => {
        return createEffectParameterDef(`EqualizerRack${i + 1}`, `[Channel${j + 1}]`, `Effect${k + 1}`, l + 1)
      }, range(3)))
    }, range(numEqualizerEffects)))
  }, range(mixxxNumDecks)))
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

const makeComponent = <D extends MidiDevice> (ctor: ((device: D) => Component[])) => (device: D) => {
  return new class extends Component {
    children: Component[]

    constructor(device: D) {
      super()
      this.children = ctor(device)
    }

    onMount() {
      super.onMount()
      for (const child of this.children) {
        child.mount()
      }

    }
    onUnmount() {
      for (const child of this.children) {
        child.unmount()
      }
      super.onUnmount()
    }
  }(device)
}


const sendColor = (template: number, index: number, color: number) => {
  sendSysexMsg([240, 0, 32, 41, 2, 17, 120, template, index, color, 247])
}

type VerticalGroupParams = {
  template: number,
  columnOffset: number,
  numDecks: number,
}

const defaultVerticalGroupParams: VerticalGroupParams = {
  template: 0,
  columnOffset: 0,
  numDecks: mixxxNumDecks,
}


const makeEq3 = ({ template, columnOffset, numDecks }: VerticalGroupParams = defaultVerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []

    const colorMap = {
      [Eq3Channel.High]: device.colors.lo_red,
      [Eq3Channel.Mid]: device.colors.lo_yellow,
      [Eq3Channel.Low]: device.colors.lo_green,
    }

    forEach((i) => {
      const col = i + columnOffset
      const eqs = eq3(col, col)
      for (const [midi, cd] of eqs) {
        const control = controlIndex[cd.type](cd.params.channel, cd.params.deck, cd.params.parameter)
        const controlComponent = new ControlComponent(control, true)
        children.push(controlComponent)

        const midiControl = device.controls[`${template}.${midi}`]
        const midiControlLed = device.controls[`${template}.${midi.replace('knob', 'led')}`]
        const midiComponent = new MidiComponent(device, midiControl)
        midiComponent.addListener('midi', ({value}: MidiMessage) => {
          setValue(control, absoluteNonLin(value, 0, 1, 4))
        })
        midiComponent.addListener('mount', () => {
          sendShortMsg(midiControlLed, colorMap[cd.params.channel])
        })
        children.push(midiComponent)
      }
    }, range(4))
  return children
}

const makeGain = ({ template, columnOffset, numDecks }: VerticalGroupParams = defaultVerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []
    forEach((i) => {
      const col = i + columnOffset
      const gains = gain(col, col)

      for (const [midi, cd] of gains) {
        const control = controlIndex[cd.type](cd.params.deck)

        const controlComponent = new ControlComponent(control, true)

        children.push(controlComponent)

        const midiControl = device.controls[`${template}.${midi}`]

        const midiComponent = new MidiComponent(device, midiControl)

        midiComponent.addListener('midi', ({value}: MidiMessage) => {
          setValue(control, value / 127)
        })

        children.push(midiComponent)
      }
    }, range(4))
  return children
}

const makeEffectSelector = (template: number) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []


  forEach((i) => {
    const row = ~~(i / 2)
    const col = i % 2
    forEach((j) => {
      console.log(`${template}.pad.${row}.${(col * 4) + j}.on`)
      const midiControl = device.controls[`${template}.pad.${row}.${(col * 4) + j}.on`]

      const midiComponent = new MidiComponent(device, midiControl)
      const control = createEffectUnitChannelDef(
        "EffectRack1", `EffectUnit${j+1}`, `Channel${i+1}`,
      ).enable
      const controlComponent = new ControlComponent(control)
      children.push(controlComponent)
      controlComponent.addListener('update', ({value}: ControlMessage) => {
        sendShortMsg(midiControl, value ? device.colors.hi_green : device.colors.black)
      })
      midiComponent.addListener('midi', ({value}: MidiMessage) => {
        if (value) {
          setValue(control, 1 - getValue(control))
        }
      })
      children.push(midiComponent)
    }, range(4))
  }, range(4))
  return children
}

const toEffectKnobRange = (value: number) => {
  return value / 63.5 - 1
}

class EffectComponent extends Component {
  rack: RackName
  unit: string
  effect: string

  effectDef: EffectDef

  loadedComponent: ControlComponent
  enabledComponent: ControlComponent
  midiComponents: MidiComponent[]

  _device: LaunchControlDevice
  _params: EffectParameterDef[]
  _buttonParams: EffectParameterDef[]
 
  constructor(device: LaunchControlDevice, template: number, row: number, rack: RackName, unit: string, effect: string) { 
    super()
    this.rack = rack
    this.unit = unit
    this.effect = effect
    this.effectDef = createEffectDef(rack, unit, effect)

    this._device = device
    this._params = []
    this._buttonParams = []

    this.loadedComponent = new ControlComponent(this.effectDef.loaded)
    this.loadedComponent.addListener('update', this.onChange.bind(this))

    this.enabledComponent = new ControlComponent(this.effectDef.enabled)
    this.enabledComponent.addListener('update', this.onChange.bind(this))

    this.midiComponents = []

    forEach((i) => {
      const midiControl = device.controls[`${template}.knob.${row}.${7-i}`]
      const midiComponent = new MidiComponent(device, midiControl)
      midiComponent.addListener('midi', ({value}: MidiMessage) => {
        if (i < this._params.length) {
          setValue(this._params[i].value, toEffectKnobRange(value))
        } else if (i < this._params.length + this._buttonParams.length) {
          setValue(this._buttonParams[i - this._params.length].button_value, Math.round(value - 127))
        }
      })
      this.midiComponents.push(midiComponent)
    }, range(8))
    
  }

  onChange() {
    const numParams = getValue(this.effectDef.num_parameters)
    const numButtonParams = getValue(this.effectDef.num_button_parameters)
    this._params = array(map((i) => {
      return createEffectParameterDef(this.rack, this.unit, this.effect, i + 1)
    }, range(numParams)))
    this._buttonParams = array(map((i) => {
      return createEffectParameterDef(this.rack, this.unit, this.effect, i + 1)
    }, range(numButtonParams)))

    forEach((i) => {
      const ledName = this.midiComponents[i].control.name.replace('knob', 'led')
      console.log(ledName)
      const ledControl = this._device.controls[ledName]
      console.log(ledControl.status, ledControl.midino)
      console.log(this._device.colors.lo_green)
      if (i < this._params.length) {
        sendShortMsg(ledControl, this._device.colors.lo_green)
      } else if (i < this._params.length + this._buttonParams.length) {
        sendShortMsg(ledControl, this._device.colors.lo_red)
      } else {
        sendShortMsg(ledControl, this._device.colors.black)
      }
    }, range(8))
  }

  onMount() {
    super.onMount()
    this.loadedComponent.mount()
    this.enabledComponent.mount()
    for (const midiComponent of this.midiComponents) {
      midiComponent.mount()
    }

  }

  onUnmount() {
    for (const midiComponent of this.midiComponents) {
      midiComponent.unmount()
    }
    this.enabledComponent.unmount()
    this.loadedComponent.unmount()
    super.onUnmount()
  }
  
}

const makeEffectUnit = (template: number, unit: number) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []

  forEach((i) => {
    const component = new EffectComponent(device, template, i, 'EffectRack1', `EffectUnit${unit + 1}`, `Effect${i + 1}`)
    children.push(component)
  }, range(3))

  return children

}

const makeApp = (device: LaunchControlDevice) => {
  const children: Component[] = []
  device.addListener('template', (template: number) => {
    console.log('template', template)
    for (const child of children) {
      child.unmount()
    }
    children.length = 0
    switch (template) {
      case 0:
        const eqs = makeComponent(makeEq3({template, columnOffset: 0, numDecks: mixxxNumDecks}))(device)
        children.push(eqs)
        const gains = makeComponent(makeGain({template, columnOffset: 0, numDecks: mixxxNumDecks}))(device)
        children.push(gains)
        const effectSelectors = makeComponent(makeEffectSelector(template))(device)
        children.push(effectSelectors)
        break
      case 1:
        const fxunit = makeComponent(makeEffectUnit(template, 0))(device)
        children.push(fxunit)
        break
    }
    for (const child of children) {
      child.mount()
    }
  })
  return children
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
  const app = makeComponent(makeApp)(device)
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  return device
}

