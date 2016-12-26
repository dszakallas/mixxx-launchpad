import { modes } from '../Utility/modes'
import { Button } from '../Launchpad'

export const pfl = (button) => (deck) => {
  return {
    bindings: {
      pfl: {
        type: 'control',
        target: deck.pfl,
        update: ({ value }, { bindings }) => value
          ? Button.send(bindings.button.button, Button.colors.hi_green)
          : Button.send(bindings.button.button, Button.colors.black)
      },
      button: {
        type: 'button',
        target: button,
        attack: ({ context }, { bindings }) => modes(context,
          () => bindings.pfl.setValue(Number(!bindings.pfl.getValue())))
      }
    }
  }
}
