import { map, range } from '@mixxx-launch/common'
import { absoluteNonLin, channelControlDefs, Component, ControlComponent, MidiControlDef, MidiMessage, sendShortMsg, setValue } from "@mixxx-launch/mixxx"
import { ControlMessage, createEffectUnitChannelDef, getValue, numDecks as mixxxNumDecks, root } from "@mixxx-launch/mixxx/src/Control"
import { LaunchControlDevice, LCMidiComponent } from './device'
import { makeEffectParameterPage } from './effectParameter'
import { makePadSelector } from './padSelector'
import { MakePage, makePager } from './pager'

export type MakeComponent = (device: LaunchControlDevice) => Component

export enum Eq3Channel {
  Low,
  Mid,
  High,
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
    return parameter === 'value' ? root.equalizerRacks[0].effect_units[deck].effects[0].parameters[channel].value :
      root.equalizerRacks[0].effect_units[deck].effects[0].parameters[channel].button_value
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

const container = (children: Component[]) => {
  return new class extends Component {
    children: Component[]

    constructor() {
      super()
      this.children = children
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
  }()
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

  const channelColorPalette = [
    device.colors.hi_red,
    device.colors.hi_yellow,
    device.colors.hi_green,
    device.colors.hi_amber,
  ] 

  for (const i of range(numDecks)) {
    const col = i + columnOffset
    const eqs = eq3(col, col)
    for (const [midi, cd] of eqs) {
      const control = controlIndex[cd.type](cd.params.channel, cd.params.deck, cd.params.parameter)
      const controlComponent = new ControlComponent(control, true)
      children.push(controlComponent)


      const midiComponent = new LCMidiComponent(device, template, midi)
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        setValue(control, absoluteNonLin(value, 0, 1, 4))
      })
      midiComponent.addListener('mount', () => {
        device.sendColor(template, midiComponent.led, channelColorPalette[i % 4])
      })
      children.push(midiComponent)
    }
  }

  return children
}

const makeGain = ({ template, columnOffset, numDecks }: VerticalGroupParams = defaultVerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []

  for (const i of range(numDecks)) {
    const col = i + columnOffset
    const gains = gain(col, col)

    for (const [midi, cd] of gains) {
      const control = controlIndex[cd.type](cd.params.deck)

      const controlComponent = new ControlComponent(control, true)

      children.push(controlComponent)

      const midiComponent = new LCMidiComponent(device, template, midi)

      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        setValue(control, value / 127)
      })

      children.push(midiComponent)
    }
  }
  return children
}

const makeKillers = (template: number) => (device: LaunchControlDevice) => {
  const children: Component[] = []

  for (const i of range(4)) {
    const row = ~~(i / 2)
    const col = i % 2

    const controls = [...map(j => root.equalizerRacks[0].effect_units[i].effects[0].parameters[2 - j].button_value, range(3)), root.quickEffectRacks[0].effect_units[i].enabled]
    for (const j of range(4)) {
      const midiComponent = new LCMidiComponent(device, template, `pad.${row}.${(col * 4) + j}`, 'on')

      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        if (value) {
          setValue(controls[j], 1 - getValue(controls[j]))
        }
      })
      children.push(midiComponent)

      const controlComponent = new ControlComponent(controls[j])

      controlComponent.addListener('update', ({ value }: ControlMessage) => {
        device.sendColor(template, midiComponent.led, value ? device.colors.hi_red : device.colors.black)
      })
      children.push(controlComponent)
      
    }
  }
  return container(children)
}


// given a MakePage, creates a MakeComponent, which rerenders the page when the template changes
// by simply reinitializing the page with the new template
const statelessFreePage = (makePage: MakePage): MakeComponent => (device: LaunchControlDevice): Component => {
  return new class extends Component {
    _device: LaunchControlDevice
    _inner: Component | null
    constructor(device: LaunchControlDevice) {
      super()
      this._device = device
      this._inner = null
    }

    onTemplate(template: number) {
      if (this._inner) {
        this._inner.unmount()
        this._inner = makePage(template)(this._device)
        this._inner.mount()
      }
    }
    onMount() {
      super.onMount()
      this._inner = makePage(this._device.template)(this._device)
      this._inner.mount()
      this._device.addListener('template', this.onTemplate.bind(this))
    }

    onUnmount() {
      this._device.removeListener('template', this.onTemplate.bind(this))
      if (this._inner) {
        this._inner.unmount()
        this._inner = null
      }
      super.onUnmount()
    }
  }(device)
}

const makeEffectSelector = (template: number) => (device: LaunchControlDevice) => {
  const children: Component[] = []

  for (const i of range(4)) {
    const row = ~~(i / 2)
    const col = i % 2
    for (const j of range(4)) {

      const midiComponent = new LCMidiComponent(device, template, `pad.${row}.${(col * 4) + j}`, 'on') 

      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        if (value) {
          setValue(control, 1 - getValue(control))
        }
      })
      children.push(midiComponent)

      const control = createEffectUnitChannelDef(
        "EffectRack1", `EffectUnit${j + 1}`, `Channel${i + 1}`,
      ).enable
      const controlComponent = new ControlComponent(control)
      controlComponent.addListener('update', ({ value }: ControlMessage) => {
        device.sendColor(template, midiComponent.led, value ? device.colors.hi_yellow : device.colors.black)
      })
      children.push(controlComponent)
    }
  }

  return container(children)
}

const makeEnablers = (template: number) => (device: LaunchControlDevice) => {
  const children: Component[] = []

  for (const i of range(4)) {
    const row = ~~(i / 2)
    const col = i % 2
    const controls = [...map(j => root.effectRacks[0].effect_units[i].effects[j].enabled, range(3)), null]
    controls.forEach((control, j) => {
      const midiControl = device.controls[`${template}.pad.${row}.${(col * 4) + j}.on`]
      const midiComponent = new LCMidiComponent(device, template, `pad.${row}.${(col * 4) + j}`, 'on')

      children.push(midiComponent)
      if (!control) {
        sendShortMsg(midiControl, device.colors.black)
        midiComponent.addListener('mount', () => {
          device.sendColor(template, midiComponent.led, device.colors.black)
        })
        return
      }

      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        if (value) {
          setValue(control, 1 - getValue(control))
        }
      })
      const controlComponent = new ControlComponent(control)
      controlComponent.addListener('update', ({ value }: ControlMessage) => {
        device.sendColor(template, midiComponent.led, value ? device.colors.hi_green : device.colors.black)
      })
      children.push(controlComponent)

    })
  }
  return container(children)
}

const makeEffectSuper = ({ template, columnOffset, numDecks }: VerticalGroupParams = defaultVerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []

  const channelColorPalette = [
    device.colors.hi_red,
    device.colors.hi_yellow,
    device.colors.hi_green,
    device.colors.hi_amber,
  ] 

  for (const i of range(numDecks)) {
    for (const j of range(3)) {
      const effect = root.effectRacks[0].effect_units[i].effects[j]
      const meta = new ControlComponent(effect.meta, true)
      children.push(meta)

      const midiComponent = new LCMidiComponent(device, template, `knob.${j}.${i + columnOffset}`)
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        setValue(effect.meta, value / 127)
      })
      children.push(midiComponent)

      const enabled = new ControlComponent(effect.enabled)
      enabled.addListener('update', ({ value }: ControlMessage) => {
        device.sendColor(template, midiComponent.led, value ? channelColorPalette[i % 4] : device.colors.black)
      })

      children.push(enabled)

    }
  }
  return children
}

const makeEffectMix = ({ template, columnOffset, numDecks }: VerticalGroupParams = defaultVerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []
  for (const i of range(numDecks)) {
    const effectUnit = root.effectRacks[0].effect_units[i]
    const mix = new ControlComponent(effectUnit.mix, true)
    children.push(mix)

    const midiComponent = new LCMidiComponent(device, template, `fader.0.${ i + columnOffset }`)
    midiComponent.addListener('midi', ({ value }: MidiMessage) => {
      setValue(effectUnit.mix, value / 127)
    })
    children.push(midiComponent)
  }

  return children
}



// const makeEffectUnit = (device: LaunchControlDevice) => {
//   const children: Component[] = []

//   // const effects = []

//   // const nextEffectUnit = new LCMidiComponent(device, device.controls[`${template}.down`])

//   // nextEffectUnit.addListener('midi', ({ value }: MidiMessage) => {
//   //   if (value) {
//   //     const nextUnit = (unit + 1) % 4
//   //     forEach((i) => {
//   //       const effectUnit = new EffectComponent(device, template, i, 'EffectRack1', `EffectUnit${nextUnit + 1}`, `Effect${i + 1}`)
//   //       effects.push(effectUnit)
//   //     }, range(3))
//   //   }
//   // })

//   // const prevEffectUnit = new LCMidiComponent(device, device.controls[`${template}.up`])

//   const prevEffectUnit = new LCMidiComponent(device, device.controls[`${template}.up`])

//   prevEffectUnit.addListener('mount', ({ value }: MidiMessage) => {
//     sendShortMsg(device.controls[`${template}.up`], device.colors.hi_red)
//   })

//   children.push(prevEffectUnit)


//   forEach((i) => {
//     const component = new EffectComponent(device, template, i, root.effectRacks[0].effect_units[unit].effects[i])
//     children.push(component)
//   }, range(3))

//   return container(children)
// }

// const makeEqPage = (template: number) => (device: LaunchControlDevice) => {
//   const children: Component[] = []
//   const eqs = container(makeEq3({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device))
//   children.push(eqs)
//   const gains = container(makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device))
//   children.push(gains)
//   return container(children)
// }

const makeKitchenSinkPage = (template: number) => (device: LaunchControlDevice) => container([
  ...makeEq3({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device),
  ...makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device),
  ...makeEffectSuper({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device),
  ...makeEffectMix({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device),
])

const makeApp = (device: LaunchControlDevice) => container([
  makePager([makeKitchenSinkPage, makeEffectParameterPage], 16)(device),
  makePager(
    [() => makePadSelector([
      statelessFreePage(makeEffectSelector),
      statelessFreePage(makeKillers),
      statelessFreePage(makeEnablers),
    ])]
  )(device),
])

export type ControllerControlDef = [number, number];

export const convertControlDef = (name: string, [status, midino]: ControllerControlDef): MidiControlDef => ({ name, status, midino })

export const useDevice = (device: LaunchControlDevice) => {
  const app = makeApp(device)
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  return device
}

export { LaunchControlDevice }

