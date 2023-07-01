import { range } from '@mixxx-launch/common'
import type { ControlComponent, ControlMessage, MidiMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { MidiComponent, parseRGBColor } from '../device'
import { modes } from '../ModifierSidebar'

export type Type = {
  type: 'hotcue'
  params: {
    cues: number
    rows: number
    start?: number
  }
  bindings: {
    [k: `midi.${string}`]: MidiComponent
    [k: `cue.${string}`]: ControlComponent
    [k: `color.${string}`]: ControlComponent
  }
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = ({ cues, rows, start = 0 }, gridPosition, deck, theme) => {
  const onHotcueMidi =
    (i: number) =>
    ({ context: { modifier }, bindings }: Control<Type>) =>
    ({ value }: MidiMessage) => {
      modes(
        modifier.getState(),
        () => {
          setValue(deck.hotcues[1 + i + start].activate, value ? 1 : 0)
        },
        () => {
          if (value) {
            if (getValue(bindings[`cue.${i}`].control)) {
              setValue(deck.hotcues[1 + i + start].clear, 1)
            } else {
              setValue(deck.hotcues[1 + i + start].set, 1)
            }
          }
        },
      )
    }
  const onHotcueColorChanged =
    (i: number) =>
    ({ context: { device }, bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      const color = parseRGBColor(value)
      if (device.supportsRGBColors) {
        device.sendRGBColor(bindings[`midi.${i}`].control, color == null ? theme.fallbackHotcueColor : color)
      }
    }
  const onHotcueEnabled =
    (i: number) =>
    ({ context: { device }, bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      if (value) {
        if (device.supportsRGBColors) {
          const color = parseRGBColor(getValue(deck.hotcues[1 + i + start].color))
          device.sendRGBColor(bindings[`midi.${i}`].control, color == null ? theme.fallbackHotcueColor : color)
        } else {
          device.sendColor(bindings[`midi.${i}`].control, device.colors.lo_yellow)
        }
      } else {
        device.clearColor(bindings[`midi.${i}`].control)
      }
    }
  const bindings: { [k: string]: any } = {}
  for (const i of range(cues)) {
    const dx = i % rows
    const dy = ~~(i / rows)
    bindings[`midi.${i}`] = {
      type: 'button',
      target: [gridPosition[0] + dx, gridPosition[1] + dy],
      midi: onHotcueMidi(i),
    }
    bindings[`cue.${i}`] = {
      type: 'control',
      target: deck.hotcues[1 + i + start].enabled,
      update: onHotcueEnabled(i),
    }
    bindings[`color.${i}`] = {
      type: 'control',
      target: deck.hotcues[1 + i + start].color,
      update: onHotcueColorChanged(i),
    }
  }

  return {
    bindings,
    state: {},
  }
}

export default make
