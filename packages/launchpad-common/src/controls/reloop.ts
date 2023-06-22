import type { ControlComponent, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { MidiComponent } from '../device'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'reloop'
  bindings: {
    button: MidiComponent
    control: ControlComponent
  }
  state: Record<string, unknown>
  params: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    button: {
      type: 'button',
      target: gridPosition,
      midi:
        ({ context: { modifier } }: Control<Type>) =>
        onAttack(() => {
          modes(
            modifier.getState(),
            () => setValue(deck.reloop_exit, 1),
            () => setValue(deck.reloop_andstop, 1),
          )
        }),
    },
    control: {
      type: 'control',
      target: deck.loop_enabled,
      update:
        ({ context: { device }, bindings }: Control<Type>) =>
        ({ value }: ControlMessage) => {
          if (value) {
            device.sendColor(bindings.button.control, device.colors.hi_green)
          } else {
            device.sendColor(bindings.button.control, device.colors.lo_green)
          }
        },
    },
  },
})

export default make
