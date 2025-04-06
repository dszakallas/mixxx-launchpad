import { posMod } from '@mixxx-launch/common'
import { ChannelControlDef, setValue } from '@mixxx-launch/mixxx'

import { ButtonBindingTemplate, MakeDeckControlTemplate, Control, midi } from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { retainAttackMode } from '@mixxx-launch/common/midi'

export type Type = {
  type: 'beatjump'
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
  bindings: { [k: number]: ButtonBindingTemplate<Type> }
}

const colors = ['green', 'red']

const make: MakeDeckControlTemplate<Type> = ({ deck, gridPosition, jumps, vertical = false, bounce = false }) => {
  const bindings: Type['bindings'] = {}
  const spec = jumps.flatMap((j) => [
    [j, -1],
    [j, 1],
  ])

  const onMidi =
    (k: number, j: [number, number], d: number) =>
    ({ bindings, state, context: { modifier, device } }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        modes(
          mode,
          () => {
            if (!state.bounce) {
              if (value) {
                setValue(deck.beatjump, j[state.set] * d)
              }
            } else {
              if (value) {
                const currentJump = j[state.set] * d
                setValue(deck.beatjump, currentJump)
                if (state.pressing != null) {
                  device.sendColor(bindings[state.pressing].control, device.colors[`lo_${colors[state.set]}`])
                }
                device.sendColor(bindings[k].control, device.colors[`hi_${colors[state.set]}`])
                state.pressing = k
                state.diff = state.diff + currentJump
              } else {
                if (state.pressing === k) {
                  device.sendColor(bindings[k].control, device.colors[`lo_${colors[state.set]}`])
                  state.pressing = null
                  setValue(deck.beatjump, -state.diff)
                  state.diff = 0
                }
              }
            }
          },
          () => {
            if (value) {
              state.set = posMod(state.set + 1, 2)
              const prefix = state.bounce ? 'lo' : 'hi'
              for (let b = 0; b < spec.length; ++b) {
                device.sendColor(bindings[b].control, device.colors[`${prefix}_${colors[state.set]}`])
              }
            }
          },
          () => {
            if (value) {
              state.bounce = !state.bounce
              const prefix = state.bounce ? 'lo' : 'hi'
              for (let b = 0; b < spec.length; ++b) {
                device.sendColor(bindings[b].control, device.colors[`${prefix}_${colors[state.set]}`])
              }
            }
          },
        )
      })
  const onMount =
    (k: number) =>
    ({ bindings, state, context: { device } }: Control<Type>) =>
    () => {
      const prefix = state.bounce ? 'lo' : 'hi'

      device.sendColor(bindings[k].control, device.colors[`${prefix}_${colors[state.set]}`])
    }

  spec.forEach(([jump, dir], i) => {
    bindings[i] = {
      type: midi(
        vertical
          ? [gridPosition[0] + (i % 2), gridPosition[1] + ~~(i / 2)]
          : [gridPosition[0] + ~~(i / 2), gridPosition[1] + (i % 2)],
      ),
      listeners: {
        midi: onMidi(i, jump as [number, number], dir as number),
        mount: onMount(i),
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
