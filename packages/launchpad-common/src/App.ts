import ModifierSidebar, { modes, retainAttackMode } from './ModifierSidebar'

import type { Modifier } from './ModifierSidebar'
import { MidiMessage } from '@mixxx-launch/mixxx'
import { Component } from '@mixxx-launch/common/component'
import { LaunchpadDevice, MidiComponent, RGBColor } from './device'
import { Action } from '@mixxx-launch/mixxx/src/util'
import { ControlContext } from './Control'
import PlaylistSidebar from './PlaylistSidebar'
import { posMod } from '@mixxx-launch/common'
import { Preset, PresetConf, makePresetTemplate, PresetState } from './Preset'

export type PresetSize = 'short' | 'tall' | 'grande'

export type Theme = {
  fallbackHotcueColor: RGBColor
  fallbackTrackColor: RGBColor
}

export type LayoutConf = {
  theme: Theme
  initialSelection: number[]
  presets: {
    [P in PresetSize]: readonly PresetConf[]
  }
}

type Block = {
  offset: [number, number]
  size: PresetSize
  channel: number
  index: number
}

type Diff = [Block[], Block[]]

const onMidi = (layout: App, channel: number, modifier: Modifier) =>
  retainAttackMode(modifier, (mode, { value }: MidiMessage) => {
    const selected = layout.chord
    modes(
      mode,
      () => {
        if (!value && selected.length) {
          const diff = reorganize(layout.getLayout(), selected)
          layout.updateLayout(diff)
          layout.removeChord()
        } else if (value) {
          layout.addToChord(channel)
        }
      },
      () => {
        if (value) {
          if (selected.length) layout.removeChord()
          const diff = cycle(channel, layout.getLayout(), 1, layout.presets)
          layout.updateLayout(diff)
        }
      },
      () => {
        if (value) {
          if (selected.length) layout.removeChord()
          const diff = cycle(channel, layout.getLayout(), -1, layout.presets)
          layout.updateLayout(diff)
        }
      },
    )
  })

const buttons = ['up', 'down', 'left', 'right', 'session', 'user1', 'user2', 'mixer'] as const

// We need an identifier for each block to save/restore its state
// We want each deck to get a separate identifier. Also, the preset templates should be unique for each deck.
// We can use the PresetSize and index to identify the preset template, and the channel to identify the deck.
// Therefore SavedPresetStateKey = {PresetSize}_{index}_{channel}
type SavedPresetStateKey = `${PresetSize}_${number}_${number}`

const makePresetStateKey = (presetSize: PresetSize, index: number, channel: number): SavedPresetStateKey =>
  `${presetSize}_${index}_${channel}`

export default class App extends Component {
  conf: LayoutConf
  bindings: [MidiComponent, Action<MidiMessage>][]
  modifier: ModifierSidebar
  presets: { [P in PresetSize]: readonly PresetConf[] }
  savedPresetStates: { [key: SavedPresetStateKey]: PresetState }
  playlistSidebar: PlaylistSidebar

  // state variables
  chord: number[]
  layout: { [key: string]: Block }
  mountedPresets: { [key: number]: Preset }
  device: LaunchpadDevice

  constructor(device: LaunchpadDevice, conf: LayoutConf) {
    super()

    this.conf = conf
    this.device = device
    this.modifier = new ModifierSidebar(device)
    this.playlistSidebar = new PlaylistSidebar(device)

    this.bindings = buttons.map((v, i) => {
      const binding = new MidiComponent(this.device, this.device.controls[v])
      return [binding, onMidi(this, i, this.modifier)]
    })

    this.presets = cycled(conf.presets)
    this.chord = []
    this.layout = {}
    this.mountedPresets = {}
    this.savedPresetStates = {}
  }

  getLayout() {
    const res = []
    for (const k in this.layout) {
      res.push(this.layout[k])
    }
    return res
  }

  updateLayout(diff: Diff) {
    diff[0].forEach((block) => {
      const ch = block.channel
      delete this.layout[ch]
      this.device.clearColor(this.bindings[ch][0].control)
      this.mountedPresets[ch].unmount()
      this.savedPresetStates[makePresetStateKey(block.size, block.index, ch)] = this.mountedPresets[ch].state
    })
    diff[1].forEach((block) => {
      this.layout[block.channel] = block
      if (block.index) {
        this.device.sendColor(this.bindings[block.channel][0].control, this.device.colors.hi_orange)
      } else {
        this.device.sendColor(this.bindings[block.channel][0].control, this.device.colors.hi_green)
      }
      const ctx: ControlContext = {
        modifier: this.modifier,
        device: this.device,
      }

      const presetTemplate = makePresetTemplate(
        this.presets[block.size][block.index],
        block.offset,
        block.channel,
        this.conf.theme,
      )

      const preset = new Preset(ctx, presetTemplate)
      const presetState = this.savedPresetStates[makePresetStateKey(block.size, block.index, block.channel)]
      if (presetState) {
        preset.state = presetState
      }
      this.mountedPresets[block.channel] = preset
      this.mountedPresets[block.channel].mount()
    })
  }

  removeChord() {
    const layout = this.getLayout()
    this.chord.forEach((ch) => {
      const found = layout.findIndex((b) => b.channel === ch)
      if (found === -1) {
        this.device.clearColor(this.bindings[ch][0].control)
      } else {
        const block = layout[found]
        if (block.index) {
          this.device.sendColor(this.bindings[ch][0].control, this.device.colors.hi_orange)
        } else {
          this.device.sendColor(this.bindings[ch][0].control, this.device.colors.hi_green)
        }
      }
      this.chord = []
    })
  }

  addToChord(channel: number) {
    if (this.chord.length === 4) {
      const rem = this.chord.shift() as number
      const found = this.getLayout().findIndex((b) => b.channel === rem)
      if (found === -1) {
        this.device.clearColor(this.bindings[rem][0].control)
      } else {
        const layout = this.layout[String(found)]
        if (layout.index) {
          this.device.sendColor(this.bindings[rem][0].control, this.device.colors.hi_orange)
        } else {
          this.device.sendColor(this.bindings[rem][0].control, this.device.colors.hi_green)
        }
      }
    }
    this.chord.push(channel)
    this.device.sendColor(this.bindings[channel][0].control, this.device.colors.hi_red)
  }

  onMount() {
    this.modifier.mount()
    this.playlistSidebar.mount()
    this.bindings.forEach(([binding, midi]) => {
      binding.mount()
      binding.on('midi', midi)
    })

    const diff = reorganize([], this.conf.initialSelection)
    this.updateLayout(diff)
  }

  onUnmount() {
    const diff = reorganize(this.getLayout(), [])
    this.updateLayout(diff)
    this.bindings.forEach(([binding, midi]) => {
      binding.removeListener('midi', midi)
      binding.unmount()
    })
    this.playlistSidebar.unmount()
    this.modifier.unmount()
  }
}

const offsets: [number, number][] = [
  [0, 0],
  [4, 0],
  [0, 4],
  [4, 4],
]

const cycled = (presets: { [P in PresetSize]: readonly PresetConf[] }) => ({
  grande: [...presets.grande, ...presets.tall, ...presets.short],
  tall: [...presets.tall, ...presets.short],
  short: presets.short,
})

const blockEquals = (a: Block, b: Block): boolean => {
  return a.offset === b.offset && a.size === b.size && a.channel === b.channel && a.index === b.index
}

const reorganize = (current: Block[], selectedChannels: number[]): Diff => {
  const next = ((chs): Block[] => {
    switch (chs.length) {
      case 0:
        return []
      case 1:
        return [{ offset: offsets[0], size: 'grande', channel: chs[0], index: 0 }]
      case 2:
        return [
          { offset: offsets[0], size: 'tall', channel: chs[0], index: 0 },
          { offset: offsets[1], size: 'tall', channel: chs[1], index: 0 },
        ]
      case 3:
        return [
          { offset: offsets[0], size: 'tall', channel: chs[0], index: 0 },
          { offset: offsets[1], size: 'short', channel: chs[1], index: 0 },
          { offset: offsets[3], size: 'short', channel: chs[2], index: 0 },
        ]
      default:
        return [
          { offset: offsets[0], size: 'short', channel: chs[0], index: 0 },
          { offset: offsets[1], size: 'short', channel: chs[1], index: 0 },
          { offset: offsets[2], size: 'short', channel: chs[2], index: 0 },
          { offset: offsets[3], size: 'short', channel: chs[3], index: 0 },
        ]
    }
  })(selectedChannels)
  return current.reduce(
    (diff, block) => {
      const [neg, pos] = diff
      const matched = pos.findIndex((b) => blockEquals(block, b))
      return matched === -1
        ? [neg.concat([block]), pos]
        : [neg, pos.slice(0, matched).concat(pos.slice(matched + 1, pos.length))]
    },
    [[], next] as Diff,
  )
}

const cycle = (
  channel: number,
  current: Block[],
  dir: 1 | -1,
  lengths: { [P in PresetSize]: readonly PresetConf[] },
): Diff => {
  const matched = current.findIndex((block) => block.channel === channel)
  if (matched === -1) {
    return [[], []]
  }
  const nextIndex = posMod(current[matched].index + dir, lengths[current[matched].size].length)
  if (nextIndex === current[matched].index) {
    return [[], []]
  }
  return [[current[matched]], [Object.assign({}, current[matched], { index: nextIndex })]]
}
