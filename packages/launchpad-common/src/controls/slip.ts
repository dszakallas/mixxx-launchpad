import { ChannelControlDef, getValue, setValue } from '@mixxx-launch/mixxx'
import { ButtonBindingTemplate, ControlBindingTemplate, MakeDeckControlTemplate, Control, midi, control } from '../Control'
import { modes, retainAttackMode } from '../ModifierSidebar'

export type Type = {
  type: 'slip'
  bindings: {
    control: ControlBindingTemplate<Type>
    button: ButtonBindingTemplate<Type>
  }
  state: { mode: boolean }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const onMidi = ({ bindings, state, context: { modifier, device } }: Control<Type>) =>
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
            state.mode = !state.mode
            const color = state.mode ? 'orange' : 'red'
            device.sendColor(bindings.button.control, device.colors[`lo_${color}`])
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
            ({ bindings, state, context: { device } }: Control<Type>) =>
              ({ value }) => {
                const color = state.mode ? 'orange' : 'red'
                if (value) {
                  device.sendColor(bindings.button.control, device.colors[`hi_${color}`])
                } else {
                  device.sendColor(bindings.button.control, device.colors[`lo_${color}`])
                }
              },
        }
      },
      button: {
        type: midi(gridPosition),
        listeners: {
          midi: onMidi,
          mount:
            ({ bindings, state, context: { device } }: Control<Type>) =>
              () => {
                const color = state.mode ? 'orange' : 'red'
                device.sendColor(bindings.button.control, device.colors[`lo_${color}`])
              },
        }
      },
    },
    state: {
      mode: true,
    },
  }
}

export default make
