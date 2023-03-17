import type { ControlComponent, ControlMessage, MidiComponent } from '@mixxx-launchpad/mixxx';
import { setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';
import { modes } from '../ModifierSidebar';

export type Type = {
  type: 'samplerPad';
  bindings: {
    playIndicator: ControlComponent;
    play: MidiComponent;
  };
  state: Record<string, unknown>;
  params: Record<string, unknown>;
};

export const make: MakeControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    playIndicator: {
      type: 'control',
      target: deck.play_indicator,
      update:
        ({ context: { device }, bindings }: Control<Type>) =>
        ({ value }: ControlMessage) => {
          if (value) {
            device.sendColor(bindings.play.control, device.colors.low_red);
          } else if (!value) {
            device.clearColor(bindings.play.control);
          }
        },
    },

    play: {
      type: 'button',
      target: gridPosition,
      attack:
        ({ context: { modifier } }: Control<Type>) =>
        (_) => {
          modes(
            modifier.getState(),
            () => setValue(deck.play_stutter, 1),
            () => setValue(deck.start_play, 1),
            () => setValue(deck.start_stop, 1)
          );
        },
    },
  },
});

export default make
