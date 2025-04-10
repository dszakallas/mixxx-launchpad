import { posMod } from '@mixxx-launch/common'
import { ChannelControlDef, getValue, setValue } from '@mixxx-launch/mixxx'
import { LaunchpadDevice } from '../device'
import { modes } from '@mixxx-launch/common/modifier'
import { ButtonBindingTemplate, MakeDeckControlTemplate, Control, midi } from '../Control'
import { retainAttackMode } from '@mixxx-launch/common/midi'

export type Type = {
  type: 'keyshift'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    shifts: readonly [number, number][]
    rows: number
  }
  bindings: { [i: number]: ButtonBindingTemplate<Type> }
  state: {
    on: number
    base: number
    set: number
  }
}

const colors = ['green', 'red']

const make: MakeDeckControlTemplate<Type> = ({ shifts, rows, gridPosition, deck }) => {
  const bindings: Type['bindings'] = {}

  const temporaryChange = (
    i: number,
    value: number,
    bindings: Control<Type>['bindings'],
    state: Type['state'],
    device: LaunchpadDevice,
  ) => {
    if (value) {
      const base = state.on === -1 ? getValue(deck.key) : state.base
      if (state.on !== -1) {
        device.sendColor(bindings[state.on].control, device.colors[`lo_${colors[state.set]}`])
      }
      device.sendColor(bindings[i].control, device.colors[`hi_${colors[state.set]}`])
      setValue(deck.key, ((base + shifts[i][state.set]) % 12) + 12)
      state.on = i
      state.base = base
    } else {
      if (state.on === i) {
        device.sendColor(bindings[i].control, device.colors[`lo_${colors[state.set]}`])
        setValue(deck.key, state.base)
        state.on = -1
      }
    }
  }

  const onMidi =
    (i: number) =>
    ({ context: { modifier, device }, bindings, state }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        modes(
          mode,
          () => temporaryChange(i, value, bindings, state, device),
          () => {
            if (value) {
              state.set = posMod(state.set + 1, 2)
              for (let i = 0; i < shifts.length; ++i) {
                device.sendColor(bindings[i].control, device.colors[`lo_${colors[state.set]}`])
              }
            }
          },
        )
      })

  shifts.forEach((_, i) => {
    const dx = i % rows
    const dy = ~~(i / rows)
    bindings[i] = {
      type: midi([gridPosition[0] + dx, gridPosition[1] + dy]),
      listeners: {
        midi: onMidi(i),
        mount:
          ({ context: { device }, bindings, state }: Control<Type>) =>
          () => {
            device.sendColor(bindings[i].control, device.colors[`lo_${colors[state.set]}`])
          },
      },
    }
  })
  return {
    bindings,
    state: {
      on: -1,
      base: -1,
      set: 0,
    },
  }
}

export default make
