import { Button } from '../../Launchpad'
import { modes } from '../../Utility/modes'

export const quantize = (button) => (deck) => {
  return {
    bindings: {
      quantize: {
        type: 'control',
        target: deck.quantize,
        update: ({ value }, { bindings }) => value
          ? Button.send(bindings.button.button, Button.colors.hi_orange)
          : Button.send(bindings.button.button, Button.colors.black)
      },
      button: {
        type: 'button',
        target: button,
        attack: ({ context }, { bindings }) => modes(context,
          () => bindings.quantize.setValue(Number(!bindings.quantize.getValue())))
      }
    }
  }
}
