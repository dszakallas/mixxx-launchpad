import { ChannelControlDef, ControlComponent, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { MidiComponent } from '../device'
import { ButtonBindingTemplate, ControlBindingTemplate, MakeDeckControlTemplate, Control } from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'quantize'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
  state: Record<string, unknown>
  bindings: {
    quantize: ControlBindingTemplate<Type>
    button: ButtonBindingTemplate<Type>
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  state: {},
  bindings: {
    quantize: {
      type: ControlComponent,
      target: deck.quantize,
      listeners: {
        update:
          ({ bindings, context: { device } }: Control<Type>) =>
            ({ value }: ControlMessage) =>
              value
                ? device.sendColor(bindings.button.control, device.colors.hi_orange)
                : device.clearColor(bindings.button.control),
      }
    },
    button: {
      type: MidiComponent,
      target: gridPosition,
      listeners: {
        midi:
          ({ bindings, context: { modifier } }: Control<Type>) =>
            onAttack(() =>
              modes(modifier.getState(), () =>
                setValue(bindings.quantize.control, Number(!getValue(bindings.quantize.control))),
              )),
      }
    },
  },
})

export default make
