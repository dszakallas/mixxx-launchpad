import { modes } from '@mixxx-launch/common/modifier'
import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { Bpm } from '@mixxx-launch/common'
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
  type: 'tap'
  bindings: {
    tap: PadBindingTemplate<Type>
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
        type: cellPad(gridPosition),
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
            ({ bindings }: Control<Type>) =>
            ({ value }: ControlMessage) => {
              if (value) {
                bindings.tap.sendColor(Color.RedHi)
              } else {
                bindings.tap.clearColor()
              }
            },
        },
      },
    },
  }
}

export default make
