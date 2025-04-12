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
import { MidiMessage } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'pfl'
  bindings: {
    pfl: ControlBindingTemplate<Type>
    button: PadBindingTemplate<Type>
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
          ({ bindings }: Control<Type>) =>
          ({ value }: ControlMessage) =>
            value ? bindings.button.sendColor(Color.GreenHi) : bindings.button.clearColor(),
      },
    },
    button: {
      type: cellPad(gridPosition),
      listeners: {
        midi: ({ context: { modifier }, bindings }: Control<Type>) =>
          onAttack((_: MidiMessage) =>
            modes(modifier.getState(), () => setValue(bindings.pfl.control, Number(!getValue(bindings.pfl.control)))),
          ),
      },
    },
  },
})

export default make
