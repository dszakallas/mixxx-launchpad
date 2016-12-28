import { Button } from '../../Launchpad'
import { Control } from '../../Mixxx'
import { modes } from '../../Utility/modes'

export const reloop = (button) => (deck) => {
  return {
    bindings: {
      button: {
        type: 'button',
        target: button,
        attack: ({ context }, { bindings }) => {
          modes(context, () => Control.setValue(deck.reloop_exit, 1))
        }
      },
      control: {
        type: 'control',
        target: deck.loop_enabled,
        update: ({ value }, { bindings }) => {
          if (value) {
            Button.send(bindings.button.button, Button.colors.hi_green)
          } else {
            Button.send(bindings.button.button, Button.colors.lo_green)
          }
        }
      }
    }
  }
}
