import type { ChannelControlDef } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { PadBindingTemplate, MakeDeckControlTemplate, Control, cellPad } from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '@mixxx-launch/common/midi'
import { MidiMessage } from '@mixxx-launch/common/midi'

export type Type = {
  type: 'loopIo'
  bindings: {
    in: PadBindingTemplate<Type>
    out: PadBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const SMALL_SAMPLES = 125

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const map = {
    in: [deck.loop_in, deck.loop_start_position],
    out: [deck.loop_out, deck.loop_end_position],
  }
  const onMidi =
    (dir: 'in' | 'out') =>
    ({ context: { modifier } }: Control<Type>) =>
      onAttack((_: MidiMessage) => {
        modes(
          modifier.getState(),
          () => {
            setValue(map[dir][0], 1)
            setValue(map[dir][0], 0)
          },
          () => {
            const ctrl = map[dir][1]
            setValue(ctrl, getValue(ctrl) - SMALL_SAMPLES)
          },
          () => {
            const ctrl = map[dir][1]
            setValue(ctrl, getValue(ctrl) + SMALL_SAMPLES)
          },
        )
      })
  return {
    bindings: {
      in: {
        type: cellPad(gridPosition),
        listeners: {
          midi: onMidi('in'),
        },
      },
      out: {
        type: cellPad([gridPosition[0] + 1, gridPosition[1]]),
        listeners: {
          midi: onMidi('out'),
        },
      },
    },
  }
}

export default make
