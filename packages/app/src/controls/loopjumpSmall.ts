import { modes } from '../ModifierSidebar';
import type {
    MidiComponent,
  MidiMessage,
} from '@mixxx-launchpad/mixxx';
import { setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';

export type Type = {
  type: 'loopjumpSmall';
  bindings: {
    back: MidiComponent;
    forth: MidiComponent;
  };
  params: {
    amount: number;
  };
  state: Record<string, unknown>;
};

const make: MakeControlTemplate<Type> = ({ amount }, button, deck) => {
  const onAttack =
    (dir: number) =>
    ({ context: { modifier } }: Control<Type>) =>
    (_: MidiMessage) => {
      modes(modifier.getState(), () => setValue(deck.loop_move, dir * amount));
    };
  return {
    state: {},
    bindings: {
      back: {
        type: 'button',
        target: button,
        attack: onAttack(-1),
        mount:
          ({ context: { device }, bindings }: Control<Type>) =>
          () => {
            device.sendColor(bindings.back.control, device.colors.hi_yellow);
          },
      },
      forth: {
        type: 'button',
        target: [button[0] + 1, button[1]],
        attack: onAttack(1),
        mount:
          ({ context: { device }, bindings }: Control<Type>) =>
          () => {
            device.sendColor(bindings.forth.control, device.colors.hi_yellow);
          },
      },
    },
  };
};

export default make;
