import { modes } from '@mixxx-launch/common/modifier'
import { ControlMessage, ChannelControlDef } from '@mixxx-launch/mixxx'
import { setValue, getValue } from '@mixxx-launch/mixxx'
import { onAttack } from '@mixxx-launch/common/midi'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'

export type Type = {
  type: 'sync'
  bindings: {
    sync: PadBindingTemplate<Type>
    syncMode: ControlBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  bindings: {
    sync: {
      type: cellPad(gridPosition),
      listeners: {
        midi: ({ bindings, context: { modifier } }: Control<Type>) =>
          onAttack(() => {
            modes(
              modifier.getState(),
              () => {
                if (getValue(bindings.syncMode.control)) {
                  setValue(deck.sync_enabled, 0)
                } else {
                  setValue(deck.sync_enabled, 1)
                }
              },
              () => {
                if (getValue(bindings.syncMode.control) === 2) {
                  setValue(deck.sync_master, 0)
                } else {
                  setValue(deck.sync_master, 1)
                }
              },
            )
          }),
      },
    },
    syncMode: {
      type: control(deck.sync_mode),
      listeners: {
        update:
          ({ bindings, context: { colorPalette } }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            if (value === 0) {
              bindings.sync.clearColor()
            } else if (value === 1) {
              bindings.sync.sendPaletteColor(colorPalette.getColor(1, 1)) // Orange bright (follower)
            } else if (value === 2) {
              bindings.sync.sendPaletteColor(colorPalette.getColor(0, 1)) // Red bright (master)
            }
          },
      },
    },
  },
})
export default make
