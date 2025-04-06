import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import {
  ButtonBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  midi,
  control,
} from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '../util'

export type Type = {
  type: 'quantize'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
  bindings: {
    quantize: ControlBindingTemplate<Type>
    button: ButtonBindingTemplate<Type>
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  bindings: {
    quantize: {
      type: control(deck.quantize),
      listeners: {
        update:
          ({ bindings, context: { device } }: Control<Type>) =>
          ({ value }: ControlMessage) =>
            value
              ? device.sendColor(bindings.button.control, device.colors.hi_orange)
              : device.clearColor(bindings.button.control),
      },
    },
    button: {
      type: midi(gridPosition),
      listeners: {
        midi: ({ bindings, context: { modifier } }: Control<Type>) =>
          onAttack(() =>
            modes(modifier.getState(), () =>
              setValue(bindings.quantize.control, Number(!getValue(bindings.quantize.control))),
            ),
          ),
      },
    },
  },
})

export default make
