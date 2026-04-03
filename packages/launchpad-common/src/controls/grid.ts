import type { ChannelControlDef } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { PadBindingTemplate, MakeDeckControlTemplate, Control, cellPad } from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { MidiMessage } from '@mixxx-launch/common/midi'

export type Type = {
  type: 'grid'
  bindings: {
    back: PadBindingTemplate<Type>
    forth: PadBindingTemplate<Type>
  }
  state: Record<string, unknown>
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const steps = {
    back: {
      normal: deck.beats_translate_earlier,
      ctrl: deck.beats_adjust_slower,
    },
    forth: {
      normal: deck.beats_translate_later,
      ctrl: deck.beats_adjust_faster,
    },
  }
  const onGrid =
    (dir: 'back' | 'forth') =>
    ({ bindings, context: { modifier, colorPalette } }: Control<Type>) =>
    ({ value }: MidiMessage) => {
      if (!value) {
        bindings[dir].clearColor()
      } else {
        modes(
          modifier.getState(),
          () => {
            bindings[dir].sendPaletteColor(colorPalette.getColor(2, 1)) // Yellow bright
            setValue(steps[dir].normal, 1)
          },
          () => {
            bindings[dir].sendPaletteColor(colorPalette.getColor(1, 1)) // Amber/Orange bright
            setValue(steps[dir].ctrl, 1)
          },
        )
      }
    }
  return {
    bindings: {
      back: {
        type: cellPad(gridPosition),
        listeners: {
          midi: onGrid('back'),
        },
      },
      forth: {
        type: cellPad([gridPosition[0] + 1, gridPosition[1]]),
        listeners: {
          midi: onGrid('forth'),
        },
      },
    },
  }
}

export default make
