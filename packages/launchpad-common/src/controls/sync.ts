import { modes } from '@mixxx-launch/common/modifier'
import { ControlMessage, ChannelControlDef } from '@mixxx-launch/mixxx'
import { setValue, getValue } from '@mixxx-launch/mixxx'
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
  type: 'sync'
  bindings: {
    sync: ButtonBindingTemplate<Type>
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
      type: midi(gridPosition),
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
          ({ bindings, context: { device } }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            if (value === 0) {
              device.clearColor(bindings.sync.control)
            } else if (value === 1) {
              device.sendColor(bindings.sync.control, device.colors.hi_orange)
            } else if (value === 2) {
              device.sendColor(bindings.sync.control, device.colors.hi_red)
            }
          },
      },
    },
  },
})
export default make
