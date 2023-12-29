import { array, map, range } from '@mixxx-launch/common'
import { ChannelControlDef, Component, ControlMessage, MidiMessage } from '@mixxx-launch/mixxx'
import { Theme } from './App'
import { Bindings, Control as BaseControl, ControlTemplate, ControlType as BaseControlType, MakeControlTemplate } from '@mixxx-launch/launch-common/src/Control'


import { ControlComponent, ControlDef, getValue, root } from '@mixxx-launch/mixxx/src/Control'
import makeControlTemplateIndex, { ControlTypeIndex } from './controls'
import { default as makeSamplerPad } from './controls/samplerPad'
import { LaunchpadDevice, MidiComponent } from './device'
import { Modifier } from './ModifierSidebar'

// constraint types with Launchpad specific Context
export type ControlContext = {
  modifier: Modifier
  device: LaunchpadDevice
}

export type ControlType = BaseControlType<ControlContext>
export type Control<C extends ControlType> = BaseControl<ControlContext, C>

export type MakeSamplerControlTemplate<C extends ControlType> = MakeControlTemplate<C>

export type MakeDeckControlTemplate<C extends ControlType> = MakeControlTemplate<C>

export type DeckPresetConf = {
  deck: readonly { pos: [number, number]; control: {
    type: ControlTypeIndex['type']
    params?: Omit<ControlTypeIndex['params'], 'gridPosition' | 'deck' | 'sampler' >
  } }[]
}

export type SamplerPalettePresetConf = {
  samplerPalette: { n: number; offset: number; rows: number }
}

export const isDeckPresetConf = (p: PresetConf): p is DeckPresetConf => 'deck' in p
export const isSamplerPalettePresetConf = (p: PresetConf): p is SamplerPalettePresetConf => 'samplerPalette' in p

export type PresetConf = DeckPresetConf | SamplerPalettePresetConf


export type ControlBindingTemplate<C extends ControlType> = {
  type: new (...args: any[]) => ControlComponent
  target: ControlDef
  listeners: {
    update?: (c: Control<C>) => (message: ControlMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export type ButtonKey = readonly [number, number]

export type ButtonBindingTemplate<C extends ControlType> = {
  type: new (...args: any[]) => MidiComponent
  target: ButtonKey
  listeners: {
    midi?: (c: Control<C>) => (message: MidiMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export type BindingTemplates<C extends ControlType> = {
  [K: string]: ButtonBindingTemplate<C> | ControlBindingTemplate<C>
}


const nameOf = (x: number, y: number) => `${7 - y},${x}`

const makeBindings = <C extends ControlType>(ctx: ControlContext, t: BindingTemplates<C>): Bindings<C> => {
  const ret: { [_: string]: unknown } = {}
  for (const k in t) {
    ret[k] = t[k].type === ControlComponent
      ? new ControlComponent((t[k] as ControlBindingTemplate<C>).target)
      : new MidiComponent(ctx.device, ctx.device.controls[nameOf(...((t[k] as ButtonBindingTemplate<C>).target))])
  }
  return ret as Bindings<C>
}


type PresetTemplate = {
  controls: ControlTemplate<any>[]
}

export class Preset extends Component {
  controls: Control<any>[]

  constructor(ctx: ControlContext, presetTemplate: PresetTemplate) {
    super()
    this.controls = presetTemplate.controls.map((c) => {
      return new BaseControl(makeBindings, c.bindings, c.state, ctx)
    })
  }

  onMount() {
    super.onMount()
    for (const control of this.controls) {
      control.mount()
    }
  }

  onUnmount() {
    for (const control of this.controls) {
      control.unmount()
    }
    super.onUnmount()
  }
}

const tr = (a: number[], b: number[]): [number, number] => [a[0] + b[0], a[1] + b[1]]

const makeDeckPresetTemplate = (
  conf: DeckPresetConf,
  gridPosition: [number, number],
  deck: ChannelControlDef,
  theme: Theme,
): PresetTemplate => ({
  controls: conf.deck.map(({ pos, control: { type, params } }) =>
    makeControlTemplateIndex[type](Object.assign({theme, gridPosition: tr(gridPosition, pos), deck}, params) as unknown as any),
  ),
})

const makeSamplerPalettePresetTemplate = (
  { samplerPalette: { n, offset, rows } }: SamplerPalettePresetConf,
  gridPosition: [number, number],
  _startingChannel: number,
  theme: Theme,
) => ({
  controls: array(map((i) => {
    const dy = 7 - ~~(i / rows)
    const dx = i % rows
    return makeSamplerPad({ theme, gridPosition: tr(gridPosition, [dx, dy]), sampler: root.samplers[i + offset]})
  }, range(Math.min(n, getValue(root.master.num_samplers))))),
})

export const makePresetTemplate = (
  conf: PresetConf,
  gridPosition: [number, number],
  channel: number,
  theme: Theme,
): PresetTemplate => {
  if (isDeckPresetConf(conf)) {
    return makeDeckPresetTemplate(conf, gridPosition, root.channels[channel], theme)
  } else {
    return makeSamplerPalettePresetTemplate(conf, gridPosition, channel, theme)
  }
}

