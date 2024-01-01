import type { ChannelControlDef, MidiMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { ButtonBindingTemplate, MakeDeckControlTemplate, Control, midi } from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'loopIo'
  bindings: {
    in: ButtonBindingTemplate<Type>
    out: ButtonBindingTemplate<Type>
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
        type: midi(gridPosition),
        listeners: {
          midi: onMidi('in'),
        },
      },
      out: {
        type: midi(gridPosition),
        listeners: {
          midi: onMidi('out'),
        },
      },
    },
  }
}

export default make
