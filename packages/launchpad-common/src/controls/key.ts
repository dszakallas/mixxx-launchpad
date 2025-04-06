import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import {
  ButtonBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  midi,
  control,
} from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '@mixxx-launch/common/midi'

export type Type = {
  type: 'key'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
  bindings: {
    button: ButtonBindingTemplate<Type>
    keylock: ControlBindingTemplate<Type>
  }
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  state: {},
  bindings: {
    button: {
      type: midi(gridPosition),
      listeners: {
        midi: ({ context: { modifier }, bindings }: Control<Type>) =>
          onAttack(() => {
            modes(
              modifier.getState(),
              () => {
                setValue(bindings.keylock.control, Number(!getValue(bindings.keylock.control)))
              },
              () => {
                setValue(deck.key, getValue(deck.key) - 1)
              },
              () => {
                setValue(deck.key, getValue(deck.key) + 1)
              },
              () => {
                setValue(deck.reset_key, 1)
              },
            )
          }),
      },
    },
    keylock: {
      type: control(deck.keylock),
      listeners: {
        update:
          ({ context: { device }, bindings }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            if (value) {
              device.sendColor(bindings.button.control, device.colors.hi_red)
            } else {
              device.clearColor(bindings.button.control)
            }
          },
      },
    },
  },
})

export default make
