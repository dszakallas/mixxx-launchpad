import { modes } from '@mixxx-launch/common/modifier'
import { range } from '@mixxx-launch/common'
import { ChannelControlDef, ControlMessage, parseRGBColor } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { MidiMessage } from '@mixxx-launch/common/midi'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'
import { Theme } from '../App'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'hotcue'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    theme: Theme
    cues: number
    rows: number
    start?: number
  }
  bindings: {
    [k: `midi.${string}`]: PadBindingTemplate<Type>
    [k: `cue.${string}`]: ControlBindingTemplate<Type>
    [k: `color.${string}`]: ControlBindingTemplate<Type>
  }
}

const make: MakeDeckControlTemplate<Type> = ({ cues, rows, start = 0, gridPosition, deck, theme }) => {
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
    ({ bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      const color = parseRGBColor(value)
      if (bindings[`midi.${i}`].supportsRGBColors) {
        bindings[`midi.${i}`].sendRGBColor(color == null ? theme.fallbackHotcueColor : color)
      }
    }
  const onHotcueEnabled =
    (i: number) =>
    ({ bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      if (value) {
        if (bindings[`midi.${i}`].supportsRGBColors) {
          const color = parseRGBColor(getValue(deck.hotcues[1 + i + start].color))
          bindings[`midi.${i}`].sendRGBColor(color == null ? theme.fallbackHotcueColor : color)
        } else {
          bindings[`midi.${i}`].sendColor(Color.YellowLow)
        }
      } else {
        bindings[`midi.${i}`].clearColor()
      }
    }
  const bindings: Type['bindings'] = {}
  for (const i of range(cues)) {
    const dx = i % rows
    const dy = ~~(i / rows)
    bindings[`midi.${i}`] = {
      type: cellPad([gridPosition[0] + dx, gridPosition[1] + dy]),
      listeners: {
        midi: onHotcueMidi(i),
      },
    }
    bindings[`cue.${i}`] = {
      type: control(deck.hotcues[1 + i + start].enabled),
      listeners: {
        update: onHotcueEnabled(i),
      },
    }
    bindings[`color.${i}`] = {
      type: control(deck.hotcues[1 + i + start].color),
      listeners: {
        update: onHotcueColorChanged(i),
      },
    }
  }

  return { bindings }
}

export default make
