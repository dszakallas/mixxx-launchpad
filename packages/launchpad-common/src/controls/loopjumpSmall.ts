import { modes } from '@mixxx-launch/common/modifier'
import { MidiMessage, onAttack } from '@mixxx-launch/common/midi'
import type { ChannelControlDef } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { PadBindingTemplate, MakeDeckControlTemplate, Control, cellPad } from '../Control'

export type Type = {
  type: 'loopjumpSmall'
  bindings: {
    back: PadBindingTemplate<Type>
    forth: PadBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    amount: number
  }
}

const make: MakeDeckControlTemplate<Type> = ({ amount, gridPosition, deck }) => {
  const onMidi =
    (dir: number) =>
    ({ context: { modifier } }: Control<Type>) =>
      onAttack((_: MidiMessage) => modes(modifier.getState(), () => setValue(deck.loop_move, dir * amount)))
  return {
    bindings: {
      back: {
        type: cellPad(gridPosition),
        listeners: {
          midi: onMidi(-1),
          mount:
            ({ bindings, context: { colorPalette } }: Control<Type>) =>
            () => {
              bindings.back.sendPaletteColor(colorPalette.getColor(2, 1))
            },
        },
      },
      forth: {
        type: cellPad([gridPosition[0] + 1, gridPosition[1]]),
        listeners: {
          midi: onMidi(1),
          mount:
            ({ bindings, context: { colorPalette } }: Control<Type>) =>
            () => {
              bindings.forth.sendPaletteColor(colorPalette.getColor(2, 1))
            },
        },
      },
    },
  }
}

export default make
