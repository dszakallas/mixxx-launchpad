import { modes } from '@mixxx-launch/common/modifier'
import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import Bpm from '../Bpm'
import { onAttack } from '../util'
import {
  ButtonBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  midi,
  control,
} from '../Control'

export type Type = {
  type: 'tap'
  bindings: {
    tap: ButtonBindingTemplate<Type>
    beat: ControlBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const tempoBpm = new Bpm()
  tempoBpm.on('tap', (avg: number) => {
    setValue(deck.bpm, avg)
  })
  return {
    bindings: {
      tap: {
        type: midi(gridPosition),
        listeners: {
          midi: ({ context: { modifier } }: Control<Type>) =>
            onAttack(() => {
              modes(
                modifier.getState(),
                () => tempoBpm.tap(),
                () => setValue(deck.bpm_tap, 1),
                () => setValue(deck.beats_translate_curpos, 1),
                () => setValue(deck.beats_translate_match_alignment, 1),
              )
            }),
        },
      },
      beat: {
        type: control(deck.beat_active),
        listeners: {
          update:
            ({ context: { device }, bindings }: Control<Type>) =>
            ({ value }: ControlMessage) => {
              if (value) {
                device.sendColor(bindings.tap.control, device.colors.hi_red)
              } else {
                device.clearColor(bindings.tap.control)
              }
            },
        },
      },
    },
  }
}

export default make
