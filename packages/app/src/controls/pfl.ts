import type { ControlComponent, ControlMessage, MidiComponent, MidiMessage } from '@mixxx-launchpad/mixxx'
import { getValue, setValue } from '@mixxx-launchpad/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { modes } from '../ModifierSidebar'

export type Type = {
  type: 'pfl'
  bindings: {
    pfl: ControlComponent
    button: MidiComponent
  }
  params: Record<string, unknown>
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    pfl: {
      type: 'control',
      target: deck.pfl,
      update:
        ({ context: { device }, bindings }: Control<Type>) =>
        ({ value }: ControlMessage) =>
          value
            ? device.sendColor(bindings.button.control, device.colors.hi_green)
            : device.clearColor(bindings.button.control),
    },
    button: {
      type: 'button',
      target: gridPosition,
      attack:
        ({ context: { modifier }, bindings }: Control<Type>) =>
        (_: MidiMessage) =>
          modes(modifier.getState(), () => setValue(bindings.pfl.control, Number(!getValue(bindings.pfl.control)))),
    },
  },
})

export default make
