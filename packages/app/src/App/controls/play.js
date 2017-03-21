import { Button } from '../../Launchpad'
import { Control } from '../../Mixxx'
import modes from '../../Utility/modes'

export default (button) => (deck) => {
  return {
    bindings: {
      playIndicator: {
        type: 'control',
        target: deck.play_indicator,
        update: ({ value }, { bindings }) => {
          if (value) {
            Button.send(bindings.play.button, Button.colors.hi_red)
          } else if (!value) {
            Button.send(bindings.play.button, Button.colors.black)
          }
        }
      },
      play: {
        type: 'button',
        target: button,
        attack: ({ context }, { bindings }) => {
          modes(context,
            () => Control.setValue(deck.play, Number(!Control.getValue(deck.play))),
            () => Control.setValue(deck.start_play, 1),
            () => Control.setValue(deck.start_stop, 1)
          )
        }
      }
    }
  }
}
