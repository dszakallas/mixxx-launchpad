import type { ControlComponent, ControlMessage, MidiComponent } from '@mixxx-launchpad/mixxx'
import { setValue } from '@mixxx-launchpad/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { modes } from '../ModifierSidebar'

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
      attack:
        ({ context: { modifier } }: Control<Type>) =>
        () => {
          modes(
            modifier.getState(),
            () => setValue(deck.reloop_exit, 1),
            () => setValue(deck.reloop_andstop, 1),
          )
        },
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
