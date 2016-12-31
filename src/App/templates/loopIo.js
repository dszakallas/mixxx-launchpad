import { Button } from '../../Launchpad'
import { Control } from '../../Mixxx'
import modes from '../../Utility/modes'

export default (button) => (deck) => {
  const onMidi = (dir) => ({ value, context }, { bindings }) => {
    modes(context, () => {
      if (value) {
        Control.setValue(deck[`loop_${dir}`], 1)
        Button.send(bindings[dir].button, Button.colors.hi_green)
      } else {
        // only needed to mimick the UI
        Control.setValue(deck[`loop_${dir}`], 0)
        Button.send(bindings[dir].button, Button.colors.black)
      }
    })
  }
  return {
    bindings: {
      in: {
        type: 'button',
        target: button,
        midi: onMidi('in')
      },
      out: {
        type: 'button',
        target: [button[0] + 1, button[1]],
        midi: onMidi('out')
      }
    }
  }
}
