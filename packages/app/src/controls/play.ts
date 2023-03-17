import type { ControlComponent, ControlMessage, MidiComponent } from '@mixxx-launchpad/mixxx';
import { getValue, setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';
import { modes } from '../ModifierSidebar';

export type Type = {
  type: 'play';
  bindings: {
    playIndicator: ControlComponent;
    play: MidiComponent;
  };
  params: Record<string, unknown>;
  state: Record<string, unknown>;
};

const make: MakeControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    playIndicator: {
      type: 'control',
      target: deck.play_indicator,
      update:
        ({ bindings, context: { device } }: Control<Type>) =>
        ({ value }: ControlMessage) => {
          if (value) {
            device.sendColor(bindings.play.control, device.colors.hi_red);
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
        () => {
          modes(
            modifier.getState(),
            () => setValue(deck.play, Number(!getValue(deck.play))),
            () => setValue(deck.start_play, 1),
            () => setValue(deck.start_stop, 1)
          );
        },
    },
  },
});

export default make;
