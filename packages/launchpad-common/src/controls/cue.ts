import { ChannelControlDef, ControlComponent, ControlMessage, MidiComponent } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'

import { ButtonBindingTemplate, ControlBindingTemplate, MakeDeckControlTemplate, Control } from '../Control'
import { modes, retainAttackMode } from '../ModifierSidebar'


export type Type = {
  type: 'cue'
  bindings: {
    cue: ButtonBindingTemplate<Type>
    cueIndicator: ControlBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef,
    gridPosition: [number, number]
  }
}


const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  bindings: {
    cue: {
      type: MidiComponent,
      target: gridPosition,
      listeners: {
        midi: ({ context: { modifier } }: Control<Type>) =>
          retainAttackMode(modifier, (mode, { value }) => {
            modes(
              mode,
              () => {
                setValue(deck.cue_default, value ? 1 : 0)
              },
              () => value && setValue(deck.cue_set, 1),
            )
          }),
      },
    },
    cueIndicator: {
      type: ControlComponent,
      target: deck.cue_indicator,
      listeners: {
        update:
          ({
            bindings: {
              cue: { control },
            },
            context: { device },
          }: Control<Type>) =>
            ({ value }: ControlMessage) => {
              if (value) {
                device.sendColor(control, device.colors.hi_red)
              } else if (!value) {
                device.clearColor(control)
              }
            },
      },
    },
  },
})

export default make
