import { ChannelControlDef, Component, getValue } from '@mixxx-launch/mixxx'
import { ControlTypeIndex } from './controls'
import { Theme } from './App'
import { array, map, range } from '@mixxx-launch/common'
import { default as makeSamplerPad } from './controls/samplerPad'
import { root } from '@mixxx-launch/mixxx/src/Control'
import { ControlTemplate } from '@mixxx-launch/launch-common/src/Control'
import { Control, ControlContext, ControlType } from './Control'
import { Control as BaseControl } from '@mixxx-launch/launch-common/src/Control'
import makeControlTemplateIndex from './controls'

export type DeckPresetConf = {
  deck: readonly {
    pos: [number, number]
    control: {
      type: ControlTypeIndex['type']
      params?: Omit<ControlTypeIndex['params'], 'gridPosition' | 'deck' | 'sampler'>
    }
  }[]
}

export type SamplerPalettePresetConf = {
  samplerPalette: { n: number; offset: number; rows: number }
}

export const isDeckPresetConf = (p: PresetConf): p is DeckPresetConf => 'deck' in p
export const isSamplerPalettePresetConf = (p: PresetConf): p is SamplerPalettePresetConf => 'samplerPalette' in p

export type PresetConf = DeckPresetConf | SamplerPalettePresetConf

const tr = (a: number[], b: number[]): [number, number] => [a[0] + b[0], a[1] + b[1]]

const makeDeckPresetTemplate = (
  conf: DeckPresetConf,
  gridPosition: [number, number],
  deck: ChannelControlDef,
  theme: Theme,
): PresetTemplate => ({
  controls: conf.deck.map(({ pos, control: { type, params } }) =>
    makeControlTemplateIndex[type](
      Object.assign({ theme, gridPosition: tr(gridPosition, pos), deck }, params) as unknown as any,
    ),
  ),
})

const makeSamplerPalettePresetTemplate = (
  { samplerPalette: { n, offset, rows } }: SamplerPalettePresetConf,
  gridPosition: [number, number],
  _startingChannel: number,
  theme: Theme,
) => ({
  controls: array(
    map(
      (i) => {
        const dy = 7 - ~~(i / rows)
        const dx = i % rows
        return makeSamplerPad({ theme, gridPosition: tr(gridPosition, [dx, dy]), sampler: root.samplers[i + offset] })
      },
      range(Math.min(n, getValue(root.master.num_samplers))),
    ),
  ),
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

type PresetTemplate = {
  controls: ControlTemplate<ControlContext, ControlType>[]
}

export class Preset extends Component {
  controls: Control<ControlType>[]

  constructor(ctx: ControlContext, presetTemplate: PresetTemplate) {
    super()
    this.controls = presetTemplate.controls.map((c) => {
      return new BaseControl(c.bindings, c.state, ctx)
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
