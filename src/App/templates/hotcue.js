import range from 'lodash.range'
import { Control } from '../../Mixxx'
import { Button } from '../../Launchpad'
import { modes } from '../../Utility/modes'

export const hotcue = (n, d, s = 0) => (button) => (deck) => {
  const onHotcueMidi = (i) => ({ context, value }, { bindings }) => {
    modes(context,
      () => {
        if (value) {
          Control.setValue(deck.hotcues[i + s].activate, 1)
        } else {
          Control.setValue(deck.hotcues[i + s].activate, 0)
        }
      },
      () => {
        if (value) {
          if (bindings[`${i}.enabled`].getValue()) {
            Control.setValue(deck.hotcues[i + s].clear, 1)
          } else {
            Control.setValue(deck.hotcues[i + s].set, 1)
          }
        }
      })
  }
  const onHotcueEnabled = (i) => ({ value }, { bindings }) => {
    if (value) {
      Button.send(bindings[`${i}.btn`].button, Button.colors.lo_yellow)
    } else {
      Button.send(bindings[`${i}.btn`].button, Button.colors.black)
    }
  }
  const bindings = { }
  range(n).map((i) => {
    const dx = i % d
    const dy = ~~(i / d)
    bindings[`${i}.btn`] = {
      type: 'button',
      target: [button[0] + dx, button[1] + dy],
      midi: onHotcueMidi(i)
    }
    bindings[`${i}.enabled`] = {
      type: 'control',
      target: deck.hotcues[i + s].enabled,
      update: onHotcueEnabled(i)
    }
  })
  return {
    bindings
  }
}
