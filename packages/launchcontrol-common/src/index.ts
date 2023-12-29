import { map, range } from '@mixxx-launch/common'
import { Control as BaseControl } from '@mixxx-launch/launch-common/src/Control'
import { Component, ControlComponent, MidiControlDef, MidiMessage, channelControlDefs, setValue } from "@mixxx-launch/mixxx"
import { numDecks as mixxxNumDecks } from "@mixxx-launch/mixxx/src/Control"
import { ControlContext, makeBindings } from './Control'
import { Eq3KillType, Eq3Type, makeEq3, makeEq3Kill } from './controls/eq'
import { FxEnablerType, FxMetaType, FxMixType, FxSelectorType, FxSuperType, QuickFxType, makeFxEnabler, makeFxMeta, makeFxMix, makeFxSelector, makeFxSuper, makeQuickFx } from './controls/fx'
import { LCMidiComponent, LaunchControlDevice } from './device'
import { makeEffectParameterPage } from './effectParameter'
import { makePadSelector } from './padSelector'
import { MakePage, makePager } from './pager'
import { VerticalGroupParams } from './util'


export type MakeComponent = (device: LaunchControlDevice) => Component

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
  // 'eq3': (channel: Eq3Channel, deck: number, parameter: 'value' | 'kill' = 'value') => {
  //   return parameter === 'value' ? root.equalizerRacks[0].effect_units[deck].effects[0].parameters[channel].value :
  //     root.equalizerRacks[0].effect_units[deck].effects[0].parameters[channel].button_value
  // },
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

const makeGain = ({ template, columnOffset, numDecks }: VerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  columnOffset = columnOffset || 0
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

// const makeKitchenSinkPage = (template: number) => (device: LaunchControlDevice) => container([
//   ...makeEq3({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device),
//   ...makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device),
//   ...makeAlt([
//     container(makeEffectSuper({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device)),
//     container(makeQuickEffect({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device)),
//   ])(template)(device),
//   ...makeEffectMix({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device),
// ])

export type GenericControlType<T> = { type: T, params: { column: number, deck: number, template: number } }

export type ControlTypeIndex = |
  GenericControlType<'eq3'> |
  GenericControlType<'gain'> |
  GenericControlType<'fxMeta3'> |
  GenericControlType<'fxMix'> |
  GenericControlType<'quickFxSuper'> |
  GenericControlType<'fxSuper'>


export type ControlConf = {
  type: ControlTypeIndex['type']
  params?: Omit<ControlTypeIndex['params'], 'template'>
}


export type GenericPage = {
  type: 'genericPage'
  controls: readonly ControlConf[]
}

export type Pages = {
  pages: readonly GenericPage[]
}


// const _pages: Pages = {
//   pages : [{
//     type: 'genericPage',
//     controls: [
//       ...map((i) => ({ type: 'eq3' as const, params: {column: i, deck: i} }), range(4)),
//       ...map((i) => ({ type: 'gain' as const, params: { column: i, deck: i } }), range(4)),
//       ...map((i) => ({ type: 'fxMeta3' as const, column: i + 4, deck: i }), range(4)),
//       // ...map((i) => ({ type: 'fxMix', column: i + 4, deck: i }), range(4)),
//     ]}, {
//       type: 'genericPage',
//       controls: [
//         // ...map((i) => ({ type: 'eq3', params: {column: i, deck: i} }), range(4)),
//         // ...map((i) => ({ type: 'gain', column: i, deck: i }), range(4)),
//         // ...map((i) => ({ type: 'quickFxSuper', column: i + 4, deck: i }), range(4)),
//         // ...map((i) => ({ type: 'fxSuper', column: i + 4, deck: i }), range(4)),
//         // ...map((i) => ({ type: 'fxMix', column: i + 4, deck: i }), range(4)),
//       ]
//     }
//   ]
// }

const makeEq3Legacy = (device: LaunchControlDevice, template: number, column: number, deck: number) => {
  const eq3 = makeEq3({ template, column, deck })
  return new BaseControl<ControlContext, Eq3Type>(makeBindings, eq3.bindings, eq3.state, { device })
}

const makeEq3KillLegacy = (device: LaunchControlDevice, template: number, row: number, column: number, deck: number) => {
  const eq3 = makeEq3Kill({ template, row, column, deck })
  return new BaseControl<ControlContext, Eq3KillType>(makeBindings, eq3.bindings, eq3.state, { device })
}

const makeFxEnablerLegacy = (device: LaunchControlDevice, template: number, row: number, column: number, deck: number) => {
  const fxEnabler = makeFxEnabler({ template, row, column, deck })
  return new BaseControl<ControlContext, FxEnablerType>(makeBindings, fxEnabler.bindings, fxEnabler.state, { device })
}

const makeFxSelectorLegacy = (device: LaunchControlDevice, template: number, row: number, column: number, deck: number) => {
  const fxSelector = makeFxSelector({ template, row, column, deck })
  return new BaseControl<ControlContext, FxSelectorType>(makeBindings, fxSelector.bindings, fxSelector.state, { device })
}

const makeFxMetaLegacy = (device: LaunchControlDevice, template: number, column: number, unit: number) => {
  const fxMeta = makeFxMeta({ template, column, unit })
  return new BaseControl<ControlContext, FxMetaType>(makeBindings, fxMeta.bindings, fxMeta.state, { device })
}

const makeFxSuperLegacy = (device: LaunchControlDevice, template: number, column: number, row: number, unit: number) => {
  const fxSuper = makeFxSuper({ template, column, row, unit })
  return new BaseControl<ControlContext, FxSuperType>(makeBindings, fxSuper.bindings, fxSuper.state, { device })
}

const makeFxMixLegacy = (device: LaunchControlDevice, template: number, column: number, unit: number) => {
  const fxMix = makeFxMix({ template, column, unit })
  return new BaseControl<ControlContext, FxMixType>(makeBindings, fxMix.bindings, fxMix.state, { device })
}

const makeQuickFxLegacy = (device: LaunchControlDevice, template: number, column: number, row: number, unit: number) => {
  const quickFx = makeQuickFx({ template, row, column, unit })
  return new BaseControl<ControlContext, QuickFxType>(makeBindings, quickFx.bindings, quickFx.state, { device })
}

const makeKitchenSinkPage = (template: number) => (device: LaunchControlDevice) => container([
  ...map((i) => makeEq3Legacy(device, template, i, i), range(4)),
  ...makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device),
  ...map((i) => makeFxMetaLegacy(device, template, i + 4, i), range(4)),
  ...map((i) => makeFxMixLegacy(device, template, i + 4, i), range(4)),
])


const makeKitchenSinkPage2 = (template: number) => (device: LaunchControlDevice) => container([
  ...map((i) => makeEq3Legacy(device, template, i, i), range(4)),
  ...makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device),
  ...map((i) => makeQuickFxLegacy(device, template, i + 4, 0, i), range(4)),
  // ...makeQuickEffect({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device),
  ...map((i) => makeFxSuperLegacy(device, template, i + 4, 1, i), range(4)),
  //...makeEffectSuper({ template, columnOffset: 4, rowOffset: 1, numDecks: mixxxNumDecks })(device),
  ...map((i) => makeFxMixLegacy(device, template, i + 4, i), range(4)),
  //...makeEffectMix({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device),
])


const makeApp = (device: LaunchControlDevice) => container([
  makePager([makeKitchenSinkPage, makeKitchenSinkPage2, makeEffectParameterPage], 16)(device),
  makePager(
    [() => makePadSelector([
      statelessFreePage((template) => (device) => {
        return container([
          makeFxSelectorLegacy(device, template, 0, 0, 0),
          makeFxSelectorLegacy(device, template, 0, 4, 1),
          makeFxSelectorLegacy(device, template, 1, 0, 2),
          makeFxSelectorLegacy(device, template, 1, 4, 3)
        ])
      }),
      statelessFreePage((template) => (device) => {
        return container([
          makeEq3KillLegacy(device, template, 0, 0, 0),
          makeEq3KillLegacy(device, template, 0, 4, 1),
          makeEq3KillLegacy(device, template, 1, 0, 2),
          makeEq3KillLegacy(device, template, 1, 4, 3)
        ])
      }),
      statelessFreePage((template) => (device) => {
        return container([
          makeFxEnablerLegacy(device, template, 0, 0, 0),
          makeFxEnablerLegacy(device, template, 0, 4, 1),
          makeFxEnablerLegacy(device, template, 1, 0, 2),
          makeFxEnablerLegacy(device, template, 1, 4, 3),
        ])
      })
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

