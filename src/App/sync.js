import { Control } from '../Mixxx'
import { Button } from '../Launchpad'
import { modes } from '../Utility/modes'

export const sync = (button) => (deck) => {
  return {
    bindings: {
      sync: {
        type: 'button',
        target: button,
        attack: ({ context }, { bindings }) => {
          modes(context,
            () => {
              if (bindings.syncMode.getValue()) {
                Control.setValue(deck.sync_enabled, 0)
              } else {
                Control.setValue(deck.sync_enabled, 1)
              }
            },
            () => {
              if (bindings.syncMode.getValue() === 2) {
                Control.setValue(deck.sync_master, 0)
              } else {
                Control.setValue(deck.sync_master, 1)
              }
            }
          )
        }
      },
      syncMode: {
        type: 'control',
        target: deck.sync_mode,
        update: ({ value }, { bindings }) => {
          if (value === 0) {
            Button.send(bindings.sync.button, Button.colors.black)
          } else if (value === 1) {
            Button.send(bindings.sync.button, Button.colors.hi_orange)
          } else if (value === 2) {
            Button.send(bindings.sync.button, Button.colors.hi_red)
          }
        }
      }
    }
  }
}
