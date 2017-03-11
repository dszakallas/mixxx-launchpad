import { Button } from '../../Launchpad'
import modes from '../../Utility/modes'
import retainAttackMode from '../../Utility/retainAttackMode'

export default (button) => (deck) => {
  const onMidi = retainAttackMode(({ context, value }, { bindings, state }) => {
    modes(context,
      () => {
        if (value) {
          bindings.control.setValue(Number(!bindings.control.getValue()))
        } else {
          if (state.mode) {
            bindings.control.setValue(Number(!bindings.control.getValue()))
          }
        }
      },
      () => {
        if (value) {
          state.mode = !state.mode
          const color = state.mode ? 'orange' : 'red'
          Button.send(bindings.button.button, Button.colors[`lo_${color}`])
        }
      }
    )
  })
  return {
    bindings: {
      control: {
        type: 'control',
        target: deck.slip_enabled,
        update: ({ value }, { bindings, state }) => {
          const color = state.mode ? 'orange' : 'red'
          if (value) {
            Button.send(bindings.button.button, Button.colors[`hi_${color}`])
          } else {
            Button.send(bindings.button.button, Button.colors[`lo_${color}`])
          }
        }
      },
      button: {
        type: 'button',
        target: button,
        midi: onMidi,
        mount: (dk, { bindings, state }) => {
          const color = state.mode ? 'orange' : 'red'
          Button.send(bindings.button.button, Button.colors[`lo_${color}`])
        }
      }
    },
    state: {
      mode: 1
    }
  }
}
