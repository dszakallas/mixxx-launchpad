import { Control } from '../../Mixxx'
import { Button } from '../../Launchpad'
import retainAttackMode from '../../Utility/retainAttackMode'
import modes from '../../Utility/modes'

export default (button) => (deck) => {
  return {
    bindings: {
      cue: {
        type: 'button',
        target: button,
        midi: retainAttackMode(({ context, value }) => {
          modes(context,
            () => {
              if (value) {
                Control.setValue(deck.cue_default, 1)
              } else {
                Control.setValue(deck.cue_default, 0)
              }
            },
            () => value && Control.setValue(deck.cue_set, 1),
          )
        })
      },
      cueIndicator: {
        type: 'control',
        target: deck.cue_indicator,
        update: ({ value }, { bindings }) => {
          if (value) {
            Button.send(bindings.cue.button, Button.colors.hi_red)
          } else if (!value) {
            Button.send(bindings.cue.button, Button.colors.black)
          }
        }
      }
    }
  }
}
