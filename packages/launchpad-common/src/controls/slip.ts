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
import { Color } from '@mixxx-launch/launch-common'
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

const colors = [
  { off: Color.RedLow, on: Color.RedHi },
  { off: Color.OrangeLow, on: Color.OrangeHi },
]

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const onMidi = ({ bindings, state, context: { modifier } }: Control<Type>) =>
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
            state.mode = posMod(state.mode + 1, colors.length)
            bindings.button.sendColor(colors[state.mode].on)
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
            ({ bindings, state }: Control<Type>) =>
            ({ value }) => {
              if (value) {
                bindings.button.sendColor(colors[state.mode].on)
              } else {
                bindings.button.sendColor(colors[state.mode].off)
              }
            },
        },
      },
      button: {
        type: cellPad(gridPosition),
        listeners: {
          midi: onMidi,
          mount:
            ({ bindings, state }: Control<Type>) =>
            () => {
              bindings.button.sendColor(colors[state.mode].off)
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
