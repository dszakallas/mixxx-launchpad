import { array, forEach, Lazy, map, memo, range } from '@mixxx-launch/common'
import { absoluteNonLin, channelControlDefs, Component, ControlComponent, MidiComponent, MidiControlDef, MidiDevice, MidiMessage, sendShortMsg, sendSysexMsg, setValue } from "@mixxx-launch/mixxx"
import { ControlDef, ControlMessage, createEffectDef, createEffectParameterDef, createEffectRackDef, createEffectUnitChannelDef, createEffectUnitDef, EffectDef, EffectParameterDef, getValue, numDecks as mixxxNumDecks, numEqualizerRacks, numQuickEffectRacks, RackName } from "@mixxx-launch/mixxx/src/Control"

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


export const quickEffectUnitDefs = array(map((i: number) => {
  return array(map((j: number) => {
    return createEffectUnitDef(`QuickEffectRack${i + 1}`, `[Channel${j + 1}]`)
  }, range(mixxxNumDecks)))
}, range(numQuickEffectRacks)))


export const effectDefs = array(map((i: number) => {
  return array(map((j: number) => {
    return array(map((k: number) => {
      return createEffectDef(`EffectRack${i + 1}`, `EffectUnit${j + 1}`, `Effect${k + 1}`)
    }, range(3)))
  }, range(4)))
}, range(numQuickEffectRacks)))


export const effectUnitDefs = array(map((i: number) => {
  return array(map((j: number) => {
    return createEffectUnitDef(`EffectRack${i + 1}`, `EffectUnit${j + 1}`)
  }, range(4)))
}, range(numQuickEffectRacks)))

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

// type Comp2 = {
//   control: ControlDef,
//   handlers: ['midi', (message: MidiMessage) => void][]
// }


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

      const midiControl = device.controls[`${template}.${midi}`]
      const midiControlLed = device.controls[`${template}.${midi.replace('knob', 'led')}`]
      const midiComponent = new MidiComponent(device, midiControl)
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        setValue(control, absoluteNonLin(value, 0, 1, 4))
      })
      midiComponent.addListener('mount', () => {
        sendShortMsg(midiControlLed, channelColorPalette[i % 4])
      })
      children.push(midiComponent)
    }
  }

  return children
}

const makeGain = ({ template, columnOffset, numDecks }: VerticalGroupParams = defaultVerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []

  for (const i of range(4)) {
    const col = i + columnOffset
    const gains = gain(col, col)

    for (const [midi, cd] of gains) {
      const control = controlIndex[cd.type](cd.params.deck)

      const controlComponent = new ControlComponent(control, true)

      children.push(controlComponent)

      const midiControl = device.controls[`${template}.${midi}`]

      const midiComponent = new MidiComponent(device, midiControl)

      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        setValue(control, value / 127)
      })

      children.push(midiComponent)
    }
  }
  return children
}


const makeKillers = (device: LaunchControlDevice) => (template: number) => {
  const children: Component[] = []

  for (const i of range(4)) {
    const row = ~~(i / 2)
    const col = i % 2

    const controls = [...map(j => equalizerParamDefs[0][i][0][2 - j].button_value, range(3)), quickEffectUnitDefs[0][i].enabled]
    for (const j of range(4)) {
      const midiControl = device.controls[`${template}.pad.${row}.${(col * 4) + j}.on`]
      const midiComponent = new MidiComponent(device, midiControl)

      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        if (value) {
          setValue(controls[j], 1 - getValue(controls[j]))
        }
      })
      children.push(midiComponent)

      const controlComponent = new ControlComponent(controls[j])

      controlComponent.addListener('update', ({ value }: ControlMessage) => {
        sendShortMsg(midiControl, value ? device.colors.hi_red : device.colors.black)
      })
      children.push(controlComponent)
      
    }
  }
  return container(children)
}


// TODO kind of a mess
const dummyTemplateFree = (makeContainer: (template: number) => Component) => (template: number): Component => {
  return new class extends Component {
    _inner: Component | null
    _template: number
    constructor(template: number) {
      super()
      this._template = template
      this._inner = null
      this.addListener('template', this.onTemplate.bind(this))
    }

    onTemplate(template: number) {
      this._template = template
      if (this._inner) {
        this._inner.unmount()
        this._inner = makeContainer(template)
        this._inner.mount()
      }

    }
    onMount() {
      super.onMount()
      this._inner = makeContainer(this._template)
      this._inner.mount()
    }

    onUnmount() {
      if (this._inner) {
        this._inner.unmount()
        this._inner = null
      }
      super.onUnmount()
    }
  }(template)
}

const makeEffectSelector = (device: LaunchControlDevice) => (template: number) => {
  const children: Component[] = []

  for (const i of range(4)) {
    const row = ~~(i / 2)
    const col = i % 2
    for (const j of range(4)) {
      const midiControl = device.controls[`${template}.pad.${row}.${(col * 4) + j}.on`]

      const midiComponent = new MidiComponent(device, midiControl)

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
        sendShortMsg(midiControl, value ? device.colors.hi_yellow : device.colors.black)
      })
      children.push(controlComponent)
    }
  }

  return container(children)
}

const makeEnablers = (device: LaunchControlDevice) => (template: number) => {
  const children: Component[] = []

  for (const i of range(4)) {
    const row = ~~(i / 2)
    const col = i % 2
    const controls = [...map(j => effectDefs[0][i][j].enabled, range(3)), null]
    controls.forEach((control, j) => {
      const midiControl = device.controls[`${template}.pad.${row}.${(col * 4) + j}.on`]
      const midiComponent = new MidiComponent(device, midiControl)

      children.push(midiComponent)
      if (!control) {
        sendShortMsg(midiControl, device.colors.black)
        midiComponent.addListener('mount', () => {
          sendShortMsg(midiControl, device.colors.black)
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
        sendShortMsg(midiControl, value ? device.colors.hi_green : device.colors.black)
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
      const effect = createEffectDef(`EffectRack1`, `EffectUnit${i + 1}`, `Effect${j + 1}`)
      const meta = new ControlComponent(effect.meta, true)
      children.push(meta)

      const midiControlLed = device.controls[`${template}.led.${j}.${i + columnOffset}`]
      const enabled = new ControlComponent(effect.enabled)
      enabled.addListener('update', ({ value }: ControlMessage) => {
        sendShortMsg(midiControlLed, value ? channelColorPalette[i % 4] : device.colors.black)
      })

      children.push(enabled)

      const midiControl = device.controls[`${template}.knob.${j}.${i + columnOffset}`]
      const midiComponent = new MidiComponent(device, midiControl)
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        setValue(effect.meta, value / 127)
      })
      children.push(midiComponent)
    }
  }

  return children
}

const makeEffectMix = ({ template, columnOffset, numDecks }: VerticalGroupParams = defaultVerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []
  for (const i of range(numDecks)) {
    const effectUnit = createEffectUnitDef(`EffectRack1`, `EffectUnit${i + 1}`)
    const mix = new ControlComponent(effectUnit.mix, true)
    children.push(mix)

    const midiControl = device.controls[`${template}.fader.0.${i + columnOffset}`]

    const midiComponent = new MidiComponent(device, midiControl)
    midiComponent.addListener('midi', ({ value }: MidiMessage) => {
      setValue(effectUnit.mix, value / 127)
    })
    children.push(midiComponent)
  }

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

const makeEffectUnit = (unit: number) => (device: LaunchControlDevice) => (template: number) => {
  const children: Component[] = []

  forEach((i) => {
    const component = new EffectComponent(device, template, i, 'EffectRack1', `EffectUnit${unit + 1}`, `Effect${i + 1}`)
    children.push(component)
  }, range(3))

  return container(children)
}

type MakePage = (template: number) => Component

const makeEqPage = (device: LaunchControlDevice) => (template: number) => {
  const children: Component[] = []
  const eqs = container(makeEq3({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device))
  children.push(eqs)
  const gains = container(makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device))
  children.push(gains)
  return container(children)
}

const makeKitchenSinkPage = (device: LaunchControlDevice) => (template: number) => {
  const children: Component[] = []
  const eqs = container(makeEq3({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device))
  children.push(eqs)
  const effectSuper = container(makeEffectSuper({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device))
  children.push(effectSuper)
  const gains = container(makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks })(device))
  children.push(gains)
  const effectMixes = container(makeEffectMix({ template, columnOffset: 4, numDecks: mixxxNumDecks })(device))
  children.push(effectMixes)
  return container(children)
}

class Pager extends Component {
  pages: Lazy<Component>[]
  repeat: number

  selected: number | null
  mounted: boolean

  constructor(pages: MakePage[], repeat: number | null = null) {
    super()
    this.selected = 0
    this.repeat = repeat || pages.length 
    this.pages = pages.map((page, i) => memo(() => page(i)))
    this.mounted = false
    this.addListener('template', this.onTemplate.bind(this))
  }

  onTemplate(template: number) {
    const newSelected = template % this.repeat < this.pages.length ? template % this.repeat : null
    if (newSelected !== this.selected) {
      if (this.mounted && this.selected != null) {
        this.pages[this.selected]().unmount()
      }
      this.selected = newSelected
      if (this.mounted && this.selected != null) {
         this.pages[this.selected]().mount()
      }
    }
    for (const page of this.pages) {
      page().emit('template', template)
    }
  }

  onMount() {
    super.onMount()
    if (this.selected != null) {
      this.pages[this.selected]().mount()
    }
    this.mounted = true
  }

  onUnmount() {
    this.mounted = false
    if (this.selected != null) {
      this.pages[this.selected]().unmount()
    }
    super.onUnmount()
  }
}

class PadSelector extends Component {
  template: number
  selected: number
  buttonComponents: Component[]
  pads: Lazy<Component>[]
  device: LaunchControlDevice

  constructor(device: LaunchControlDevice, pads: [MakePage, MakePage, MakePage], template: number, selected: number = 0) {
    super()
    this.template = template
    this.selected = selected
    this.device = device
    this.pads = pads.map((page) => memo(() => page(this.template)))
    this.buttonComponents = []
    this.assignButtonComponents()
  }

  assignButtonComponents() {
    const btns = ['mute', 'solo', 'arm']
    const buttonComponents = btns.map((btn) =>
      new MidiComponent(this.device, this.device.controls[`${this.template}.${btn}.on`])
    )

    buttonComponents.forEach((btn, i) => {
      btn.addListener('mount', () => {
        sendShortMsg(btn.control, i === this.selected ? this.device.colors.hi_yellow : this.device.colors.black)
      })
      btn.addListener('midi', ({ value }: MidiMessage) => {
        if (value && i !== this.selected) {
          buttonComponents.forEach((btn, j) => {
            sendShortMsg(btn.control, j === i ? this.device.colors.hi_yellow : this.device.colors.black)
          })
          this.pads[this.selected]().unmount()
          this.selected = i
          this.pads[this.selected]().mount()
        }
      })
    })
    this.buttonComponents = buttonComponents
  }

  onTemplate(template: number) {
    for (const buttonComponent of this.buttonComponents) {
      buttonComponent.unmount()
    }
    this.template = template
    this.assignButtonComponents()
    for (const buttonComponent of this.buttonComponents) {
      buttonComponent.mount()
    }
    for (const pad of this.pads) {
      pad().emit('template', template)
    }
  }

  onMount() {
    this.pads[this.selected]().mount()
    for (const buttonComponent of this.buttonComponents) {
      buttonComponent.mount()
    }
    this.addListener('template', this.onTemplate.bind(this))
  }

  onUnmount() {
    this.removeListener('template', this.onTemplate.bind(this))
    for (const buttonComponent of this.buttonComponents) {
      buttonComponent.unmount()
    }
    this.pads[this.selected]().unmount()
  }
}

const makeApp = (device: LaunchControlDevice) => {
  const children: Component[] = []
  const mainPager = new Pager([makeKitchenSinkPage(device), makeEffectUnit(0)(device)], 16)
  children.push(mainPager)

  const padPager = new Pager([
    (template) => new PadSelector(device, ([makeEffectSelector(device), makeKillers(device), makeEnablers(device)] as const).map(fn => dummyTemplateFree(fn)), template),
  ])

  children.push(padPager)

  device.addListener('template', (template: number) => {
    for (const child of children) {
      child.emit('template', template)
    }
    // for (const child of children) {
    //   child.unmount()
    // }
    // children.length = 0
    // if (template === 0) {
    //   const eqs = makeComponent(makeEq3({ template, columnOffset: 0, numDecks: mixxxNumDecks }))(device)
    //   children.push(eqs)
    //   const gains = makeComponent(makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks }))(device)
    //   children.push(gains)
    //   // const killers = makeComponent(makeKillers(template))(device)
    //   // children.push(killers)
    // } else if (template === 1) {
    //   const effectSuper = makeComponent(makeEffectSuper({ template, columnOffset: 0, numDecks: mixxxNumDecks }))(device)
    //   children.push(effectSuper)
    //   // const effectSelectors = makeComponent(makeEffectSelector(template))(device)
    //   // children.push(effectSelectors)
    // } else if (template === 2) {
    //   const fxunit = makeComponent(makeEffectUnit(template, 0))(device)
    //   children.push(fxunit)
    // } else if (template === 3) {
    //   const eqs = makeComponent(makeEq3({ template, columnOffset: 0, numDecks: mixxxNumDecks }))(device)
    //   children.push(eqs)
    //   const effectSuper = makeComponent(makeEffectSuper({ template, columnOffset: 4, numDecks: mixxxNumDecks }))(device)
    //   children.push(effectSuper)
    //   const gains = makeComponent(makeGain({ template, columnOffset: 0, numDecks: mixxxNumDecks }))(device)
    //   children.push(gains)
    //   const effectMixes = makeComponent(makeEffectMix({ template, columnOffset: 4, numDecks: mixxxNumDecks }))(device)
    //   children.push(effectMixes)
    //   const killers = makeComponent(makeKillers(template))(device)
    //   children.push(killers)
    // }

    // for (const child of children) {
    //   child.mount()
    // }
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
  const app = container(makeApp(device))
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  return device
}

