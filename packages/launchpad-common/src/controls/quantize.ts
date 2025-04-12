import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'quantize'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
  bindings: {
    quantize: ControlBindingTemplate<Type>
    button: PadBindingTemplate<Type>
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => ({
  bindings: {
    quantize: {
      type: control(deck.quantize),
      listeners: {
        update:
          ({ bindings }: Control<Type>) =>
          ({ value }: ControlMessage) =>
            value ? bindings.button.sendColor(Color.OrangeHi) : bindings.button.clearColor(),
      },
    },
    button: {
      type: cellPad(gridPosition),
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
