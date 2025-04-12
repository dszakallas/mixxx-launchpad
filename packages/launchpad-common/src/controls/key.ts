import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'key'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
  bindings: {
    button: PadBindingTemplate<Type>
    keylock: ControlBindingTemplate<Type>
  }
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  state: {},
  bindings: {
    button: {
      type: cellPad(gridPosition),
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
          ({ bindings }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            if (value) {
              bindings.button.sendColor(Color.RedHi)
            } else {
              bindings.button.clearColor()
            }
          },
      },
    },
  },
})

export default make
