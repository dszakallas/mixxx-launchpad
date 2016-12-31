import { Control } from '../../Mixxx'
import { Button } from '../../Launchpad'
import retainAttackMode from '../../Utility/retainAttackMode'
import modes from '../../Utility/modes'

export default (button) => (deck) => {
  const rateEpsilon = 1e-3

  const getDirection = (rate) => {
    if (rate < -rateEpsilon) {
      return 'down'
    } else if (rate > rateEpsilon) {
      return 'up'
    } else {
      return ''
    }
  }

  const onNudgeMidi = (dir) => retainAttackMode(({ context, value }, { bindings, state }) => {
    if (value) {
      state[dir].pressing = true
      if (state.down.pressing && state.up.pressing) {
        Control.setValue(deck.rate, 0)
      } else {
        modes(context,
          () => {
            state[dir].nudging = true
            Button.send(bindings[dir].button, Button.colors.hi_yellow)
            Control.setValue(deck[`rate_temp_${dir}`], 1)
          },
          () => {
            Button.send(bindings[dir].button, Button.colors.hi_red)
            Control.setValue(deck[`rate_perm_${dir}`], 1)
          },
          () => {
            state[dir].nudging = true
            Button.send(bindings[dir].button, Button.colors.lo_yellow)
            Control.setValue(deck[`rate_temp_${dir}_small`], 1)
          },
          () => {
            Button.send(bindings[dir].button, Button.colors.lo_red)
            Control.setValue(deck[`rate_perm_${dir}_small`], 1)
          }
        )
      }
    } else {
      state[dir].nudging = state[dir].pressing = false
      if (getDirection(bindings.rate.getValue()) === dir) {
        Button.send(bindings[dir].button, Button.colors.lo_amber)
      } else {
        Button.send(bindings[dir].button, Button.colors.black)
      }
      modes(context,
        () => Control.setValue(deck[`rate_temp_${dir}`], 0),
        undefined,
        () => Control.setValue(deck[`rate_temp_${dir}_small`], 0)
      )
    }
  })

  const onRate = ({ value }, { state, bindings }) => {
    let up = Button.colors.black
    let down = Button.colors.black
    if (value < -rateEpsilon) {
      down = Button.colors.lo_amber
    } else if (value > rateEpsilon) {
      up = Button.colors.lo_amber
    }

    if (!state.down.nudging) {
      Button.send(bindings.down.button, down)
    }

    if (!state.up.nudging) {
      Button.send(bindings.up.button, up)
    }
  }

  return {
    bindings: {
      down: {
        type: 'button',
        target: button,
        midi: onNudgeMidi('down')
      },
      up: {
        type: 'button',
        target: [button[0] + 1, button[1]],
        midi: onNudgeMidi('up')
      },
      rate: {
        type: 'control',
        target: deck.rate,
        update: onRate
      }
    },
    state: {
      rateEpsilon,
      up: {
        pressing: false,
        nudging: false
      },
      down: {
        pressing: false,
        nudging: false
      }
    }
  }
}
