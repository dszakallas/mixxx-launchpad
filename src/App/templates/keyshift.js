import { modes } from '../../Utility/modes'
import { retainAttackMode } from '../../Utility/retainAttackMode'
import { Control } from '../../Mixxx'
import { Button } from '../../Launchpad'

export const keyshift = (shifts, d) => (button) => (deck) => {
  const bindings = { }

  const temporaryChange = (i, value, bindings, state) => {
    if (value) {
      const base = state.on === -1 ? Control.getValue(deck.key) : state.base
      if (state.on !== -1) {
        Button.send(bindings[state.on].button, Button.colors[`lo_${state.color[state.set]}`])
      }
      Button.send(bindings[i].button, Button.colors[`hi_${state.color[state.set]}`])
      Control.setValue(deck.key, ((base + shifts[i][state.set]) % 12) + 12)
      state.on = i
      state.base = base
    } else {
      if (state.on === i) {
        Button.send(bindings[i].button, Button.colors[`lo_${state.color[state.set]}`])
        Control.setValue(deck.key, state.base)
        state.on = -1
      }
    }
  }

  const onMidi = (i) => retainAttackMode(({ context, value }, { bindings, state }) => {
    modes(context,
      () => temporaryChange(i, value, bindings, state),
      () => {
        if (value) {
          if (state.set === 1) {
            state.set = 0
            for (let i = 0; i < shifts.length; ++i) {
              Button.send(bindings[i].button, Button.colors[`lo_${state.color[state.set]}`])
            }
          }
        }
      },
      () => {
        if (value) {
          if (state.set === 0) {
            state.set = 1
            for (let i = 0; i < shifts.length; ++i) {
              Button.send(bindings[i].button, Button.colors[`lo_${state.color[state.set]}`])
            }
          }
        }
      }
    )
  })

  shifts.forEach((s, i) => {
    const dx = i % d
    const dy = ~~(i / d)
    const position = [button[0] + dx, button[1] + dy]
    bindings[i] = {
      type: 'button',
      target: position,
      midi: onMidi(i),
      mount: function (dontKnow, { bindings, state }) {
        Button.send(bindings[i].button, Button.colors[`lo_${state.color[state.set]}`])
      }
    }
  })
  return {
    bindings,
    state: {
      on: -1,
      base: null,
      set: 0,
      color: [
        'green',
        'amber'
      ]
    }
  }
}
