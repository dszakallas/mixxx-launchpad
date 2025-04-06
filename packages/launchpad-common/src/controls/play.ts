import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '@mixxx-launch/common/midi'
import {
  ButtonBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  midi,
  control,
} from '../Control'

export type Type = {
  type: 'play'
  bindings: {
    playIndicator: ControlBindingTemplate<Type>
    play: ButtonBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  bindings: {
    playIndicator: {
      type: control(deck.play_indicator),
      listeners: {
        update:
          ({ bindings, context: { device } }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            if (value) {
              device.sendColor(bindings.play.control, device.colors.hi_red)
            } else if (!value) {
              device.clearColor(bindings.play.control)
            }
          },
      },
    },
    play: {
      type: midi(gridPosition),
      listeners: {
        midi: ({ context: { modifier } }: Control<Type>) =>
          onAttack(() => {
            modes(
              modifier.getState(),
              () => setValue(deck.play, Number(!getValue(deck.play))),
              () => setValue(deck.start_play, 1),
              () => setValue(deck.start_stop, 1),
            )
          }),
      },
    },
  },
})

export default make
