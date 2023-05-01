import type { MidiComponent, MidiMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'loopIo'
  bindings: {
    in: MidiComponent
    out: MidiComponent
  }
  state: Record<string, unknown>
  params: Record<string, unknown>
}

const SMALL_SAMPLES = 125 as const

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => {
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
    state: {},
    bindings: {
      in: {
        type: 'button',
        target: gridPosition,
        midi: onMidi('in'),
      },
      out: {
        type: 'button',
        target: [gridPosition[0] + 1, gridPosition[1]],
        midi: onMidi('out'),
      },
    },
  }
}

export default make
