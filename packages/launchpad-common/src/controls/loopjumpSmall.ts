import { modes } from '@mixxx-launch/common/modifier'
import type { ChannelControlDef, MidiMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { onAttack } from '../util'
import { ButtonBindingTemplate, MakeDeckControlTemplate, Control, midi } from '../Control'

export type Type = {
  type: 'loopjumpSmall'
  bindings: {
    back: ButtonBindingTemplate<Type>
    forth: ButtonBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    amount: number
  }
}

const make: MakeDeckControlTemplate<Type> = ({ amount, gridPosition, deck }) => {
  const onMidi =
    (dir: number) =>
    ({ context: { modifier } }: Control<Type>) =>
      onAttack((_: MidiMessage) => modes(modifier.getState(), () => setValue(deck.loop_move, dir * amount)))
  return {
    bindings: {
      back: {
        type: midi(gridPosition),
        listeners: {
          midi: onMidi(-1),
          mount:
            ({ context: { device }, bindings }: Control<Type>) =>
            () => {
              device.sendColor(bindings.back.control, device.colors.hi_yellow)
            },
        },
      },
      forth: {
        type: midi([gridPosition[0] + 1, gridPosition[1]]),
        listeners: {
          midi: onMidi(1),
          mount:
            ({ context: { device }, bindings }: Control<Type>) =>
            () => {
              device.sendColor(bindings.forth.control, device.colors.hi_yellow)
            },
        },
      },
    },
  }
}

export default make
