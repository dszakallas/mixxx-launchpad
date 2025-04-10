import { modes } from '@mixxx-launch/common/modifier'
import { ControlMessage, ChannelControlDef } from '@mixxx-launch/mixxx'
import { setValue, getValue } from '@mixxx-launch/mixxx'
import {
  ButtonBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  midi,
  control,
} from '../Control'
import { retainAttackMode } from '@mixxx-launch/common/midi'

export type Type = {
  type: 'nudge'
  bindings: {
    up: ButtonBindingTemplate<Type>
    down: ButtonBindingTemplate<Type>
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
    ({ context: { modifier, device }, bindings, state }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        if (value) {
          state[dir] = true
          if (state.down && state.up) {
            setValue(deck.rate, 0)
          } else {
            modes(
              mode,
              () => {
                device.sendColor(bindings[dir].control, device.colors.hi_yellow)
                setValue(deck[`rate_temp_${dir}`], 1)
              },
              () => {
                device.sendColor(bindings[dir].control, device.colors.hi_red)
                setValue(deck[`rate_perm_${dir}`], 1)
              },
              () => {
                device.sendColor(bindings[dir].control, device.colors.lo_yellow)
                setValue(deck[`rate_temp_${dir}_small`], 1)
              },
              () => {
                device.sendColor(bindings[dir].control, device.colors.lo_red)
                setValue(deck[`rate_perm_${dir}_small`], 1)
              },
            )
          }
        } else {
          state[dir] = false
          if (getDirection(getValue(bindings.rate.control)) === dir) {
            device.sendColor(bindings[dir].control, device.colors.lo_orange)
          } else {
            device.clearColor(bindings[dir].control)
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
    ({ context: { device }, bindings, state }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      let up = device.colors.black
      let down = device.colors.black
      const rate = getDirection(value)
      if (rate === 'down') {
        down = device.colors.lo_orange
      } else if (rate === 'up') {
        up = device.colors.lo_orange
      }

      if (!state.down) {
        device.sendColor(bindings.down.control, down)
      }

      if (!state.up) {
        device.sendColor(bindings.up.control, up)
      }
    }

  return {
    bindings: {
      down: {
        type: midi(gridPosition),
        listeners: {
          midi: onNudgeMidi('down'),
        },
      },
      up: {
        type: midi([gridPosition[0] + 1, gridPosition[1]]),
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
