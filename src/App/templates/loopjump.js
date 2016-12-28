import { Button } from '../../Launchpad'
import { Control, console } from '../../Mixxx'
import { modes } from '../../Utility/modes'
import { retainAttackMode } from '../../Utility/retainAttackMode'

import flatMap from 'lodash.flatmap'

export const loopjump = (jumps) => (button) => (deck) => {
  const bindings = { }
  const onMidi = (k, j, d) => retainAttackMode(({ value, context }, { bindings, state }) => {
    modes(context,
      () => {
        if (!state.mode) {
          if (value) {
            Control.setValue(deck.loop_move, j[state.set] * d)
          }
        } else {
          if (value) {
            const currentJump = j[state.set] * d
            Control.setValue(deck.loop_move, currentJump)
            if (state.pressing != null) {
              Button.send(bindings[state.pressing].button, Button.colors[`lo_${state.color[state.set]}`])
            }
            Button.send(bindings[k].button, Button.colors[`hi_${state.color[state.set]}`])
            state.pressing = k
            state.diff = state.diff + currentJump
          } else {
            if (state.pressing === k) {
              Button.send(bindings[k].button, Button.colors[`lo_${state.color[state.set]}`])
              state.pressing = null
              Control.setValue(deck.loop_move, -state.diff)
              state.diff = 0
            }
          }
        }
      },
      () => {
        if (value) {
          if (state.set === 1) {
            state.set = 0
            const prefix = state.mode ? 'lo' : 'hi'
            for (let b = 0; b < spec.length; ++b) {
              Button.send(bindings[b].button, Button.colors[`${prefix}_${state.color[state.set]}`])
            }
          }
        }
      },
      () => {
        if (value) {
          if (state.set === 0) {
            state.set = 1
            const prefix = state.mode ? 'lo' : 'hi'
            for (let b = 0; b < spec.length; ++b) {
              Button.send(bindings[b].button, Button.colors[`${prefix}_${state.color[state.set]}`])
            }
          }
        }
      },
      () => {
        if (value) {
          state.mode = !state.mode
          const prefix = state.mode ? 'lo' : 'hi'
          for (let b = 0; b < spec.length; ++b) {
            Button.send(bindings[b].button, Button.colors[`${prefix}_${state.color[state.set]}`])
          }
        }
      }
    )
  })
  const onMount = (k) => (dontKnow, { bindings, state }) => {
    const prefix = state.mode ? 'lo' : 'hi'
    Button.send(bindings[k].button, Button.colors[`${prefix}_${state.color[state.set]}`])
  }
  const spec = flatMap(jumps, (j, i) => [[j, 1], [j, -1]])

  spec.forEach(([jump, dir], i) => {
    bindings[i] = {
      type: 'button',
      target: [button[0] + i % 2, button[1] + ~~(i / 2)],
      midi: onMidi(i, jump, dir),
      mount: onMount(i)
    }
  })
  return {
    bindings,
    state: {
      mode: false,
      pressing: 0,
      diff: 0,
      set: 0,
      color: [
        'yellow',
        'orange'
      ]
    }
  }
}
