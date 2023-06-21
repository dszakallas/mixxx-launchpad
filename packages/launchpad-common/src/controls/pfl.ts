import type { ControlComponent, ControlMessage, MidiMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { MidiComponent } from '../device'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

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
      midi:
        ({ context: { modifier }, bindings }: Control<Type>) =>
        onAttack((_: MidiMessage) =>
          modes(modifier.getState(), () => setValue(bindings.pfl.control, Number(!getValue(bindings.pfl.control))))),
    },
  },
})

export default make
