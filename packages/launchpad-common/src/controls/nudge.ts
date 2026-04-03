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
    ({ bindings, state, context: { modifier, colorPalette } }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        if (value) {
          state[dir] = true
          if (state.down && state.up) {
            setValue(deck.rate, 0)
          } else {
            modes(
              mode,
              () => {
                bindings[dir].sendPaletteColor(colorPalette.getColor(2, 1)) // Yellow bright (temp)
                setValue(deck[`rate_temp_${dir}`], 1)
              },
              () => {
                bindings[dir].sendPaletteColor(colorPalette.getColor(0, 1)) // Red bright (perm)
                setValue(deck[`rate_perm_${dir}`], 1)
              },
              () => {
                bindings[dir].sendPaletteColor(colorPalette.getColor(2, 0)) // Yellow dim (temp small)
                setValue(deck[`rate_temp_${dir}_small`], 1)
              },
              () => {
                bindings[dir].sendPaletteColor(colorPalette.getColor(0, 0)) // Red dim (perm small)
                setValue(deck[`rate_perm_${dir}_small`], 1)
              },
            )
          }
        } else {
          state[dir] = false
          if (getDirection(getValue(bindings.rate.control)) === dir) {
            bindings[dir].sendPaletteColor(colorPalette.getColor(1, 0)) // Orange dim (rate active)
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
    ({ bindings, state, context: { colorPalette } }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      const rate = getDirection(value)

      if (!state.down) {
        if (rate === 'down') {
          bindings.down.sendPaletteColor(colorPalette.getColor(1, 0)) // Orange dim
        } else {
          bindings.down.clearColor()
        }
      }

      if (!state.up) {
        if (rate === 'up') {
          bindings.up.sendPaletteColor(colorPalette.getColor(1, 0)) // Orange dim
        } else {
          bindings.up.clearColor()
        }
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
