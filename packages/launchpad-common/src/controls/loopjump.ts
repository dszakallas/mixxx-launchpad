import { posMod } from '@mixxx-launch/common'
import { ChannelControlDef, setValue } from '@mixxx-launch/mixxx'
import { PadBindingTemplate, MakeDeckControlTemplate, Control, cellPad } from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { retainAttackMode } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'loopjump'

  bindings: {
    [k: number]: PadBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    jumps: readonly [number, number][]
    vertical?: boolean
    bounce?: boolean
  }
  state: {
    bounce: boolean
    pressing: number | null
    diff: number
    set: number
  }
}

const colors = [
  { off: Color.GreenLow, on: Color.GreenHi },
  { off: Color.RedLow, on: Color.RedHi },
]

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck, jumps, vertical = false, bounce = false }) => {
  const bindings: Type['bindings'] = {}
  const onMidi =
    (k: number, j: [number, number], d: number) =>
    ({ context: { modifier }, bindings, state }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        modes(
          mode,
          () => {
            if (!state.bounce) {
              if (value) {
                setValue(deck.loop_move, j[state.set] * d)
              }
            } else {
              if (value) {
                const currentJump = j[state.set] * d

                setValue(deck.loop_move, currentJump)
                if (state.pressing != null) {
                  bindings[state.pressing].sendColor(colors[state.set].off)
                }
                bindings[k].sendColor(colors[state.set].on)
                state.pressing = k
                state.diff = state.diff + currentJump
              } else {
                if (state.pressing === k) {
                  bindings[k].sendColor(colors[state.set].off)
                  state.pressing = null
                  setValue(deck.loop_move, -state.diff)
                  state.diff = 0
                }
              }
            }
          },
          () => {
            if (value) {
              state.set = posMod(state.set + 1, 2)
              const prefix = state.bounce ? 'off' : 'on'
              for (let b = 0; b < spec.length; ++b) {
                bindings[b].sendColor(colors[state.set][prefix])
              }
            }
          },
          () => {
            if (value) {
              state.bounce = !state.bounce
              const prefix = state.bounce ? 'off' : 'on'
              for (let b = 0; b < spec.length; ++b) {
                bindings[b].sendColor(colors[state.set][prefix])
              }
            }
          },
        )
      })
  const onMount =
    (k: number) =>
    ({ bindings, state }: Control<Type>) =>
    () => {
      const prefix = state.bounce ? 'off' : 'on'
      bindings[k].sendColor(colors[state.set][prefix])
    }
  const spec = jumps.flatMap((j) => [
    [j, 1],
    [j, -1],
  ])

  spec.forEach(([jump, dir], i) => {
    bindings[i] = {
      type: cellPad(
        vertical
          ? [gridPosition[0] + (i % 2), gridPosition[1] + ~~(i / 2)]
          : [gridPosition[0] + ~~(i / 2), gridPosition[1] + (i % 2)],
      ),
      listeners: {
        mount: onMount(i),
        midi: onMidi(i, jump as [number, number], dir as number),
      },
    }
  })
  return {
    bindings,
    state: {
      bounce: bounce,
      pressing: null,
      diff: 0,
      set: 0,
    },
  }
}

export default make
