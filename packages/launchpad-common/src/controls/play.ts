import { ChannelControlDef, ControlComponent, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { MidiComponent } from '../device'
import { ButtonBindingTemplate, ControlBindingTemplate, MakeDeckControlTemplate, Control } from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

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
      type: ControlComponent,
      target: deck.play_indicator,
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
      }
    },
    play: {
      type: MidiComponent,
      target: gridPosition,
      listeners: {
        midi:
          ({ context: { modifier } }: Control<Type>) =>
            onAttack(() => {
              modes(
                modifier.getState(),
                () => setValue(deck.play, Number(!getValue(deck.play))),
                () => setValue(deck.start_play, 1),
                () => setValue(deck.start_stop, 1),
              )
            }),
      }
    },
  },
})

export default make
