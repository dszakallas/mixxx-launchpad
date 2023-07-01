import { modes } from '../ModifierSidebar'
import type { ControlMessage, ControlComponent } from '@mixxx-launch/mixxx'
import { setValue, getValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { onAttack } from '../util'
import { MidiComponent } from '../device'

export type Type = {
  type: 'sync'
  bindings: {
    sync: MidiComponent
    syncMode: ControlComponent
  }
  params: Record<string, unknown>
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    sync: {
      type: 'button',
      target: gridPosition,
      midi:
        ({ bindings, context: { modifier } }: Control<Type>) =>
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
    syncMode: {
      type: 'control',
      target: deck.sync_mode,
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
})
export default make