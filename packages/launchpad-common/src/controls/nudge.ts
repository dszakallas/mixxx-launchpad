import { modes, retainAttackMode } from '../ModifierSidebar'
import type { ControlMessage, ControlComponent } from '@mixxx-launch/mixxx'
import { setValue, getValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { MidiComponent } from '../device'

export type Type = {
  type: 'nudge'
  bindings: {
    up: MidiComponent
    down: MidiComponent
    rate: ControlComponent
  }
  state: {
    up: boolean
    down: boolean
  }
  params: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => {
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
        type: 'button',
        target: gridPosition,
        midi: onNudgeMidi('down'),
      },
      up: {
        type: 'button',
        target: [gridPosition[0] + 1, gridPosition[1]],
        midi: onNudgeMidi('up'),
      },
      rate: {
        type: 'control',
        target: deck.rate,
        update: onRate,
      },
    },
    state: {
      up: false,
      down: false,
    },
  }
}
export default make
