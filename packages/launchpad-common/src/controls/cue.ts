import { modes } from '@mixxx-launch/common/modifier'
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
import { retainAttackMode } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'cue'
  bindings: {
    cue: PadBindingTemplate<Type>
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
      type: cellPad(gridPosition),
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
          ({ bindings: { cue } }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            if (value) {
              cue.sendColor(Color.RedHi)
            } else if (!value) {
              cue.clearColor()
            }
          },
      },
    },
  },
})

export default make
