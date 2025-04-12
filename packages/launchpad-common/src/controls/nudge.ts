import { modes } from '@mixxx-launch/common/modifier'
import { ControlMessage, ChannelControlDef } from '@mixxx-launch/mixxx'
import { setValue, getValue } from '@mixxx-launch/mixxx'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'
import { retainAttackMode } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'nudge'
  bindings: {
    up: PadBindingTemplate<Type>
    down: PadBindingTemplate<Type>
    rate: ControlBindingTemplate<Type>
  }
  state: {
    up: boolean
    down: boolean
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const rateEpsilon = 1e-3

  const getDirection = (rate: number) => {
    if (rate < -rateEpsilon) {
      return 'up'
    } else if (rate > rateEpsilon) {
      return 'down'
    } else {
      return ''
    }
  }

  const onNudgeMidi =
    (dir: 'up' | 'down') =>
    ({ bindings, state, context: { modifier } }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        if (value) {
          state[dir] = true
          if (state.down && state.up) {
            setValue(deck.rate, 0)
          } else {
            modes(
              mode,
              () => {
                bindings[dir].sendColor(Color.YellowHi)
                setValue(deck[`rate_temp_${dir}`], 1)
              },
              () => {
                bindings[dir].sendColor(Color.RedHi)
                setValue(deck[`rate_perm_${dir}`], 1)
              },
              () => {
                bindings[dir].sendColor(Color.YellowLow)
                setValue(deck[`rate_temp_${dir}_small`], 1)
              },
              () => {
                bindings[dir].sendColor(Color.RedLow)
                setValue(deck[`rate_perm_${dir}_small`], 1)
              },
            )
          }
        } else {
          state[dir] = false
          if (getDirection(getValue(bindings.rate.control)) === dir) {
            bindings[dir].sendColor(Color.OrangeLow)
          } else {
            bindings[dir].clearColor()
          }
          modes(
            mode,
            () => setValue(deck[`rate_temp_${dir}`], 0),
            undefined,
            () => setValue(deck[`rate_temp_${dir}_small`], 0),
          )
        }
      })

  const onRate =
    ({ bindings, state }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      let up = Color.Black
      let down = Color.Black
      const rate = getDirection(value)
      if (rate === 'down') {
        down = Color.OrangeLow
      } else if (rate === 'up') {
        up = Color.OrangeLow
      }

      if (!state.down) {
        bindings.down.sendColor(down)
      }

      if (!state.up) {
        bindings.up.sendColor(up)
      }
    }

  return {
    bindings: {
      down: {
        type: cellPad(gridPosition),
        listeners: {
          midi: onNudgeMidi('down'),
        },
      },
      up: {
        type: cellPad([gridPosition[0] + 1, gridPosition[1]]),
        listeners: {
          midi: onNudgeMidi('up'),
        },
      },
      rate: {
        type: control(deck.rate),
        listeners: {
          update: onRate,
        },
      },
    },
    state: {
      up: false,
      down: false,
    },
  }
}
export default make
