import { MidiComponent, setValue } from '@mixxx-launchpad/mixxx'

import { Control, MakeDeckControlTemplate } from '../Control'
import { modes, ModifierState, retainAttackMode } from '../ModifierSidebar'
import { posMod } from '../util'

export type Type = {
  type: 'beatjump'
  params: {
    jumps: readonly [number, number][]
    vertical?: boolean
  }
  state: {
    mode: boolean
    pressing: number | null
    diff: number
    set: number
  }
  bindings: { [k: number]: MidiComponent }
}

const colors = ['green', 'red'] as const

const make: MakeDeckControlTemplate<Type> = ({ jumps, vertical = false }, gridPosition, deck) => {
  const bindings: { [k: string]: any } = {}
  const spec = jumps.flatMap((j) => [
    [j, -1],
    [j, 1],
  ])

  const onMidi =
    (k: number, j: [number, number], d: number) =>
    ({ bindings, state, context: { modifier, device } }: Control<Type>) =>
      retainAttackMode(modifier, (mode: ModifierState, { value }) => {
        modes(
          mode,
          () => {
            if (!state.mode) {
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
              const prefix = state.mode ? 'lo' : 'hi'
              for (let b = 0; b < spec.length; ++b) {
                device.sendColor(bindings[b].control, device.colors[`${prefix}_${colors[state.set]}`])
              }
            }
          },
          () => {
            if (value) {
              state.mode = !state.mode
              const prefix = state.mode ? 'lo' : 'hi'
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
      const prefix = state.mode ? 'lo' : 'hi'

      device.sendColor(bindings[k].control, device.colors[`${prefix}_${colors[state.set]}`])
    }

  spec.forEach(([jump, dir], i) => {
    bindings[i] = {
      type: 'button',
      target: vertical
        ? [gridPosition[0] + (i % 2), gridPosition[1] + ~~(i / 2)]
        : [gridPosition[0] + ~~(i / 2), gridPosition[1] + (i % 2)],
      midi: onMidi(i, jump as [number, number], dir as number),
      mount: onMount(i),
    }
  })
  return {
    bindings,
    state: {
      mode: false,
      pressing: null,
      diff: 0,
      set: 0,
    },
  }
}

export default make
