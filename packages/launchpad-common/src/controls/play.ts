import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '@mixxx-launch/common/midi'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'play'
  bindings: {
    playIndicator: ControlBindingTemplate<Type>
    play: PadBindingTemplate<Type>
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
          ({ bindings }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            if (value) {
              bindings.play.sendColor(Color.RedHi)
            } else if (!value) {
              bindings.play.clearColor()
            }
          },
      },
    },
    play: {
      type: cellPad(gridPosition),
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
