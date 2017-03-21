import { Button } from '../../Launchpad'
import { Control } from '../../Mixxx'

export default (button) => (deck) => {
  const onMount = (k) => (dk, { bindings }) => {
    Button.send(bindings[k].button, Button.colors.lo_yellow)
  }
  const onAttack = (k) => () => {
    Control.setValue(deck[`loop_${k}`], 1)
  }
  return {
    bindings: {
      halve: {
        type: 'button',
        target: button,
        mount: onMount('halve'),
        attack: onAttack('halve')
      },
      double: {
        type: 'button',
        target: [button[0] + 1, button[1]],
        mount: onMount('double'),
        attack: onAttack('double')
      }
    }
  }
}
