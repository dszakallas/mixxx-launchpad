import { ChannelControlDef, ControlComponent, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { MidiComponent } from '../device'
import { ButtonBindingTemplate, ControlBindingTemplate, MakeDeckControlTemplate, Control } from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'reloop'
  bindings: {
    button: ButtonBindingTemplate<Type>
    control: ControlBindingTemplate<Type>
  }
  state: Record<string, unknown>
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  state: {},
  bindings: {
    button: {
      type: MidiComponent,
      target: gridPosition,
      listeners: {
        midi:
          ({ context: { modifier } }: Control<Type>) =>
            onAttack(() => {
              modes(
                modifier.getState(),
                () => setValue(deck.reloop_exit, 1),
                () => setValue(deck.reloop_andstop, 1),
              )
            }),
      }
    },
    control: {
      type: ControlComponent,
      target: deck.loop_enabled,
      listeners: {
        update:
          ({ context: { device }, bindings }: Control<Type>) =>
            ({ value }: ControlMessage) => {
              if (value) {
                device.sendColor(bindings.button.control, device.colors.hi_green)
              } else {
                device.sendColor(bindings.button.control, device.colors.lo_green)
              }
            },
      }
    },
  },
})

export default make
