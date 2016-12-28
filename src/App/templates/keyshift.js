import { modes } from '../../Utility/modes'
import { retainAttackMode } from '../../Utility/retainAttackMode'
import { Control, console } from '../../Mixxx'
import { Button } from '../../Launchpad'

export const keyshift = (shifts, d) => (button) => (deck) => {
  const bindings = { }

  const temporaryChange = (i, dir, value, bindings, state) => {
    if (value) {
      const base = state.on === -1 ? Control.getValue(deck.key) : state.base
      if (state.on !== -1) {
        Button.send(bindings[state.on].button, Button.colors.lo_amber)
      }
      Button.send(bindings[i].button, dir === 1 ? Button.colors.hi_green : Button.colors.hi_red)
      Control.setValue(deck.key, base + shifts[i] * dir)
      state.on = i
      state.base = base
    } else {
      if (state.on === i) {
        Button.send(bindings[i].button, Button.colors.lo_amber)
        Control.setValue(deck.key, state.base)
        state.on = -1
      }
    }
  }

  const onMidi = (i) => retainAttackMode(({ context, value }, { bindings, state }) => {
    modes(context,
      () => temporaryChange(i, 1, value, bindings, state),
      () => temporaryChange(i, -1, value, bindings, state)
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
      mount: function (dontKnow, { bindings }) {
        Button.send(bindings[i].button, Button.colors.lo_amber)
      }
    }
  })
  return {
    bindings,
    state: {
      on: -1,
      base: null
    }
  }
}
