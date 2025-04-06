import { modes } from '@mixxx-launch/common/modifier'
import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'

import {
  ButtonBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  midi,
  control,
} from '../Control'
import { retainAttackMode } from '../ModifierSidebar'

export type Type = {
  type: 'cue'
  bindings: {
    cue: ButtonBindingTemplate<Type>
    cueIndicator: ControlBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  bindings: {
    cue: {
      type: midi(gridPosition),
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
      type: control(deck.cue_indicator),
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
