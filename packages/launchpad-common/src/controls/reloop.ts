import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
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

export type Type = {
  type: 'reloop'
  bindings: {
    button: PadBindingTemplate<Type>
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
      type: cellPad(gridPosition),
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
          ({ bindings, context: { colorPalette } }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            const brightness = value ? 1 : 0
            bindings.button.sendPaletteColor(colorPalette.getColor(3, brightness))
          },
      },
    },
  },
})

export default make
