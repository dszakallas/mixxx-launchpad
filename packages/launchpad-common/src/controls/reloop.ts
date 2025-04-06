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
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '@mixxx-launch/common/midi'

export type Type = {
  type: 'reloop'
  bindings: {
    button: ButtonBindingTemplate<Type>
    control: ControlBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  bindings: {
    button: {
      type: midi(gridPosition),
      listeners: {
        midi: ({ context: { modifier } }: Control<Type>) =>
          onAttack(() => {
            modes(
              modifier.getState(),
              () => setValue(deck.reloop_exit, 1),
              () => setValue(deck.reloop_andstop, 1),
            )
          }),
      },
    },
    control: {
      type: control(deck.loop_enabled),
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
      },
    },
  },
})

export default make
