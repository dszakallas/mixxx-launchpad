import { Button } from '../../Launchpad'
import { Control } from '../../Mixxx'
import { modes } from '../../Utility/modes'

export const grid = (button) => (deck) => {
  const onGrid = (dir) => ({ value, context }, { bindings, state }) => {
    if (!value) {
      Button.send(bindings[dir].button, Button.colors.black)
    } else {
      modes(context,
        () => {
          Button.send(bindings[dir].button, Button.colors.hi_yellow)
          Control.setValue(state[dir].normal, 1)
        },
        () => {
          Button.send(bindings[dir].button, Button.colors.hi_amber)
          Control.setValue(state[dir].ctrl, 1)
        })
    }
  }
  return {
    bindings: {
      back: {
        type: 'button',
        target: button,
        midi: onGrid('back')
      },
      forth: {
        type: 'button',
        target: [button[0] + 1, button[1]],
        midi: onGrid('forth')
      }
    },
    state: {
      back: {
        normal: deck.beats_translate_earlier,
        ctrl: deck.beats_adjust_slower
      },
      forth: {
        normal: deck.beats_translate_later,
        ctrl: deck.beats_adjust_faster
      }
    }
  }
}
