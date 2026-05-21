import { modes } from '@mixxx-launch/common/modifier'
import { ChannelControlDef, getValue, setValue } from '@mixxx-launch/mixxx'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'
import { retainAttackMode } from '@mixxx-launch/common/midi'
import { posMod } from '@mixxx-launch/common'

export type Type = {
  type: 'slip'
  bindings: {
    control: ControlBindingTemplate<Type>
    button: PadBindingTemplate<Type>
  }
  state: { mode: number }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const numModes = 2 // Red and Orange modes
  const onMidi = ({ bindings, state, context: { modifier, colorPalette } }: Control<Type>) =>
    retainAttackMode(modifier, (mode, { value }) => {
      modes(
        mode,
        () => {
          if (value) {
            setValue(bindings.control.control, Number(!getValue(bindings.control.control)))
          } else {
            if (state.mode) {
              setValue(bindings.control.control, Number(!getValue(bindings.control.control)))
            }
          }
        },
        () => {
          if (value) {
            state.mode = posMod(state.mode + 1, numModes)
            bindings.button.sendPaletteColor(colorPalette.getColor(state.mode, 1))
          }
        },
      )
    })
  return {
    bindings: {
      control: {
        type: control(deck.slip_enabled),
        listeners: {
          update:
            ({ bindings, state, context: { colorPalette } }: Control<Type>) =>
            ({ value }) => {
              const brightness = value ? 1 : 0
              bindings.button.sendPaletteColor(colorPalette.getColor(state.mode, brightness))
            },
        },
      },
      button: {
        type: cellPad(gridPosition),
        listeners: {
          midi: onMidi,
          mount:
            ({ bindings, state, context: { colorPalette } }: Control<Type>) =>
            () => {
              bindings.button.sendPaletteColor(colorPalette.getColor(state.mode, 0))
            },
        },
      },
    },
    state: {
      mode: 1,
    },
  }
}

export default make
