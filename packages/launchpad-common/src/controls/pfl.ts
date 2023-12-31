import { ChannelControlDef, ControlMessage, MidiMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { ButtonBindingTemplate, ControlBindingTemplate, MakeDeckControlTemplate, Control, midi, control } from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'pfl'
  bindings: {
    pfl: ControlBindingTemplate<Type>
    button: ButtonBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  bindings: {
    pfl: {
      type: control(deck.pfl),
      listeners: {
        update:
          ({ context: { device }, bindings }: Control<Type>) =>
            ({ value }: ControlMessage) =>
              value
                ? device.sendColor(bindings.button.control, device.colors.hi_green)
                : device.clearColor(bindings.button.control),
      }
    },
    button: {
      type: midi(gridPosition),
      listeners: {
        midi:
          ({ context: { modifier }, bindings }: Control<Type>) =>
            onAttack((_: MidiMessage) =>
              modes(modifier.getState(), () => setValue(bindings.pfl.control, Number(!getValue(bindings.pfl.control))))),
      }
    },
  },
})

export default make
