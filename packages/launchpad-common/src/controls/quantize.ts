import type { ControlComponent, ControlMessage, MidiComponent } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'quantize'
  params: Record<string, unknown>
  state: Record<string, unknown>
  bindings: {
    quantize: ControlComponent
    button: MidiComponent
  }
}

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    quantize: {
      type: 'control',
      target: deck.quantize,
      update:
        ({ bindings, context: { device } }: Control<Type>) =>
        ({ value }: ControlMessage) =>
          value
            ? device.sendColor(bindings.button.control, device.colors.hi_orange)
            : device.clearColor(bindings.button.control),
    },
    button: {
      type: 'button',
      target: gridPosition,
      midi:
        ({ bindings, context: { modifier } }: Control<Type>) =>
        onAttack(() =>
          modes(modifier.getState(), () =>
            setValue(bindings.quantize.control, Number(!getValue(bindings.quantize.control))),
          )),
    },
  },
})

export default make
