import { posMod } from '@mixxx-launch/common'
import { ChannelControlDef, getValue, setValue } from '@mixxx-launch/mixxx'
import { modes } from '@mixxx-launch/common/modifier'
import { PadBindingTemplate, MakeDeckControlTemplate, Control, cellPad } from '../Control'
import { retainAttackMode } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'keyshift'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    shifts: readonly [number, number][]
    rows: number
  }
  bindings: { [i: number]: PadBindingTemplate<Type> }
  state: {
    on: number
    base: number
    set: number
  }
}

const colors = [
  { off: Color.GreenLow, on: Color.GreenHi },
  { off: Color.RedLow, on: Color.RedHi },
]

const make: MakeDeckControlTemplate<Type> = ({ shifts, rows, gridPosition, deck }) => {
  const bindings: Type['bindings'] = {}

  const temporaryChange = (i: number, value: number, bindings: Control<Type>['bindings'], state: Type['state']) => {
    if (value) {
      const base = state.on === -1 ? getValue(deck.key) : state.base
      if (state.on !== -1) {
        bindings[state.on].sendColor(colors[state.set].off)
      }
      bindings[i].sendColor(colors[state.set].on)
      setValue(deck.key, ((base + shifts[i][state.set]) % 12) + 12)
      state.on = i
      state.base = base
    } else {
      if (state.on === i) {
        bindings[i].sendColor(colors[state.set].off)
        setValue(deck.key, state.base)
        state.on = -1
      }
    }
  }

  const onMidi =
    (i: number) =>
    ({ bindings, state, context: { modifier } }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        modes(
          mode,
          () => temporaryChange(i, value, bindings, state),
          () => {
            if (value) {
              state.set = posMod(state.set + 1, 2)
              for (let i = 0; i < shifts.length; ++i) {
                bindings[i].sendColor(Color.YellowLow)
              }
            }
          },
        )
      })

  shifts.forEach((_, i) => {
    const dx = i % rows
    const dy = ~~(i / rows)
    bindings[i] = {
      type: cellPad([gridPosition[0] + dx, gridPosition[1] + dy]),
      listeners: {
        midi: onMidi(i),
        mount:
          ({ bindings, state }: Control<Type>) =>
          () => {
            bindings[i].sendColor(colors[state.set].off)
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
