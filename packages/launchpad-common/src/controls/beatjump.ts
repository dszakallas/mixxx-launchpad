import { posMod } from '@mixxx-launch/common'
import { ChannelControlDef, setValue } from '@mixxx-launch/mixxx'

import { PadBindingTemplate, MakeDeckControlTemplate, Control, cellPad } from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { retainAttackMode } from '@mixxx-launch/common/midi'

export type Type = {
  type: 'beatjump'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    jumps: readonly [number, number][]
    vertical?: boolean
    bounce?: boolean
  }
  state: {
    bounce: boolean
    pressing: number | null
    diff: number
    set: number
  }
  bindings: { [k: number]: PadBindingTemplate<Type> }
}

const make: MakeDeckControlTemplate<Type> = ({ deck, gridPosition, jumps, vertical = false, bounce = false }) => {
  const bindings: Type['bindings'] = {}
  const spec = jumps.flatMap((j) => [
    [j, -1],
    [j, 1],
  ])

  const onMidi =
    (k: number, j: [number, number], d: number) =>
    ({ bindings, state, context: { modifier, colorPalette } }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        modes(
          mode,
          () => {
            if (!state.bounce) {
              if (value) {
                setValue(deck.beatjump, j[state.set] * d)
              }
            } else {
              if (value) {
                const currentJump = j[state.set] * d
                setValue(deck.beatjump, currentJump)
                if (state.pressing != null) {
                  // Use palette: valence = state.set, brightness = 0 (dim/off)
                  bindings[state.pressing].sendPaletteColor(colorPalette.getColor(state.set, 0))
                }
                // Use palette: valence = state.set, brightness = 1 (bright/on)
                bindings[k].sendPaletteColor(colorPalette.getColor(state.set, 1))
                state.pressing = k
                state.diff = state.diff + currentJump
              } else {
                if (state.pressing === k) {
                  // Use palette: valence = state.set, brightness = 0 (dim/off)
                  bindings[k].sendPaletteColor(colorPalette.getColor(state.set, 0))
                  state.pressing = null
                  setValue(deck.beatjump, -state.diff)
                  state.diff = 0
                }
              }
            }
          },
          () => {
            if (value) {
              state.set = posMod(state.set + 1, 2)
              const brightness = state.bounce ? 0 : 1 // dim when bounce mode, bright when normal
              for (let b = 0; b < spec.length; ++b) {
                bindings[b].sendPaletteColor(colorPalette.getColor(state.set, brightness))
              }
            }
          },
          () => {
            if (value) {
              state.bounce = !state.bounce
              const brightness = state.bounce ? 0 : 1 // dim when bounce mode, bright when normal
              for (let b = 0; b < spec.length; ++b) {
                bindings[b].sendPaletteColor(colorPalette.getColor(state.set, brightness))
              }
            }
          },
        )
      })
  const onMount =
    (k: number) =>
    ({ bindings, state, context: { colorPalette } }: Control<Type>) =>
    () => {
      const brightness = state.bounce ? 0 : 1 // dim when bounce mode, bright when normal
      bindings[k].sendPaletteColor(colorPalette.getColor(state.set, brightness))
    }

  spec.forEach(([jump, dir], i) => {
    bindings[i] = {
      type: cellPad(
        vertical
          ? [gridPosition[0] + (i % 2), gridPosition[1] + ~~(i / 2)]
          : [gridPosition[0] + ~~(i / 2), gridPosition[1] + (i % 2)],
      ),
      listeners: {
        midi: onMidi(i, jump as [number, number], dir as number),
        mount: onMount(i),
      },
    }
  })
  return {
    bindings,
    state: {
      bounce: bounce,
      pressing: null,
      diff: 0,
      set: 0,
    },
  }
}

export default make
