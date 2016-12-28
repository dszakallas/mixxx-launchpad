import { Button } from '../../Launchpad'
import { Control } from '../../Mixxx'
import { modes } from '../../Utility/modes'

export const key = (button) => (deck) => {
  return {
    bindings: {
      button: {
        type: 'button',
        target: button,
        attack: ({ context }, { bindings }) => {
          modes(context,
            () => {
              bindings.keylock.setValue(Number(!bindings.keylock.getValue()))
            },
            () => {
              Control.setValue(deck.key, Control.getValue(deck.key) - 1)
            },
            () => {
              Control.setValue(deck.key, Control.getValue(deck.key) + 1)
            },
            () => {
              Control.setValue(deck.reset_key, 1)
            }
          )
        }
      },
      keylock: {
        type: 'control',
        target: deck.keylock,
        update: ({ value }, { bindings }) => {
          if (value) {
            Button.send(bindings.button.button, Button.colors.hi_red)
          } else {
            Button.send(bindings.button.button, Button.colors.black)
          }
        }
      }
    }
  }
}
