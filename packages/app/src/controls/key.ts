import type {
    ControlComponent,
  ControlMessage,
  MidiComponent,
  MidiMessage,
} from '@mixxx-launchpad/mixxx';
import { getValue, setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeDeckControlTemplate } from '../Control';
import { modes } from '../ModifierSidebar';

export type Type = {
  type: 'key';
  params: Record<string, unknown>;
  bindings: {
    button: MidiComponent;
    keylock: ControlComponent;
  };
  state: Record<string, unknown>;
};

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    button: {
      type: 'button',
      target: gridPosition,
      attack:
        ({ context: { modifier }, bindings }: Control<Type>) =>
        (_: MidiMessage) => {
          modes(
            modifier.getState(),
            () => {
              setValue(
                bindings.keylock.control,
                Number(!getValue(bindings.keylock.control))
              );
            },
            () => {
              setValue(deck.key, getValue(deck.key) - 1);
            },
            () => {
              setValue(deck.key, getValue(deck.key) + 1);
            },
            () => {
              setValue(deck.reset_key, 1);
            }
          );
        },
    },
    keylock: {
      type: 'control',
      target: deck.keylock,
      update:
        ({ context: { device }, bindings }: Control<Type>) =>
        ({ value }: ControlMessage) => {
          if (value) {
            device.sendColor(bindings.button.control, device.colors.hi_red);
          } else {
            device.clearColor(bindings.button.control);
          }
        },
    },
  },
});

export default make;
