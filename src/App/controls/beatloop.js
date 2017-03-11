import { Button } from '../../Launchpad'
import { Control } from '../../Mixxx'
import modes from '../../Utility/modes'

export default (loops, d) => (button) => (deck) => {
  const bindings = { }
  const onAttack = (l) => ({ context }) => {
    modes(context,
      () => Control.setValue(deck.beatloops[l].toggle, 1)
    )
  }

  const onUpdate = (i) => ({ value }, { bindings }) => {
    if (value) {
      Button.send(bindings[i].button, Button.colors.hi_red)
    } else {
      Button.send(bindings[i].button, Button.colors.lo_red)
    }
  }

  loops.forEach((loop, i) => {
    const dx = i % d
    const dy = ~~(i / d)
    bindings[i] = {
      type: 'button',
      target: [button[0] + dx, button[1] + dy],
      attack: onAttack(loop)
    }
    bindings[`${loop}.enabled`] = {
      type: 'control',
      target: deck.beatloops[loop].enabled,
      update: onUpdate(i)
    }
  })
  return {
    bindings
  }
}
