import { modes } from '../ModifierSidebar'
import type { ChannelControlDef, MidiMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { onAttack } from '../util'
import { MidiComponent } from '../device'
import { ButtonBindingTemplate, MakeDeckControlTemplate, Control } from '../Control'

export type Type = {
  type: 'loopjumpSmall'
  bindings: {
    back: ButtonBindingTemplate<Type>
    forth: ButtonBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef,
    gridPosition: [number, number],
    amount: number,
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
        type: MidiComponent,
        target: gridPosition,
        listeners: {
          midi: onMidi(-1),
          mount:
            ({ context: { device }, bindings }: Control<Type>) =>
              () => {
                device.sendColor(bindings.back.control, device.colors.hi_yellow)
              },
        }
      },
      forth: {
        type: MidiComponent,
        target: [gridPosition[0] + 1, gridPosition[1]],
        listeners: {
          midi: onMidi(1),
          mount:
            ({ context: { device }, bindings }: Control<Type>) =>
              () => {
                device.sendColor(bindings.forth.control, device.colors.hi_yellow)
              },
        }
      },
    },
  }
}

export default make
