import { posMod } from '@mixxx-launch/common'
import { ChannelControlDef, getValue, setValue } from '@mixxx-launch/mixxx'
import { modes } from '@mixxx-launch/common/modifier'
import { PadBindingTemplate, MakeDeckControlTemplate, Control, cellPad } from '../Control'
import { retainAttackMode } from '@mixxx-launch/common/midi'

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

const make: MakeDeckControlTemplate<Type> = ({ shifts, rows, gridPosition, deck }) => {
  const bindings: Type['bindings'] = {}

  const temporaryChange = (
    i: number,
    value: number,
    bindings: Control<Type>['bindings'],
    state: Type['state'],
    colorPalette: Control<Type>['context']['colorPalette'],
  ) => {
    if (value) {
      const base = state.on === -1 ? getValue(deck.key) : state.base
      if (state.on !== -1) {
        bindings[state.on].sendPaletteColor(colorPalette.getColor(state.set === 0 ? 3 : 0, 0)) // Green or Red dim
      }
      bindings[i].sendPaletteColor(colorPalette.getColor(state.set === 0 ? 3 : 0, 1)) // Green or Red bright
      setValue(deck.key, ((base + shifts[i][state.set]) % 12) + 12)
      state.on = i
      state.base = base
    } else {
      if (state.on === i) {
        bindings[i].sendPaletteColor(colorPalette.getColor(state.set === 0 ? 3 : 0, 0)) // Green or Red dim
        setValue(deck.key, state.base)
        state.on = -1
      }
    }
  }

  const onMidi =
    (i: number) =>
    ({ bindings, state, context: { modifier, colorPalette } }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        modes(
          mode,
          () => temporaryChange(i, value, bindings, state, colorPalette),
          () => {
            if (value) {
              state.set = posMod(state.set + 1, 2)
              for (let i = 0; i < shifts.length; ++i) {
                bindings[i].sendPaletteColor(colorPalette.getColor(2, 0)) // Yellow dim (mode switch indicator)
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
          ({ bindings, state, context: { colorPalette } }: Control<Type>) =>
          () => {
            bindings[i].sendPaletteColor(colorPalette.getColor(state.set === 0 ? 3 : 0, 0)) // Green or Red dim
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
