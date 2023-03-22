import type { ControlComponent, ControlMessage, MidiComponent } from '@mixxx-launchpad/mixxx';
import { setValue } from '@mixxx-launchpad/mixxx';

import { Control, MakeDeckControlTemplate } from '../Control';
import { modes, retainAttackMode } from '../ModifierSidebar';

export type Type = {
  type: 'cue';
  bindings: {
    cue: MidiComponent;
    cueIndicator: ControlComponent;
  };
  params: Record<string, unknown>;
  state: Record<string, unknown>;
};

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    cue: {
      type: 'button',
      target: gridPosition,
      midi: ({ context: { modifier } }: Control<Type>) =>
        retainAttackMode(modifier, (mode, { value }) => {
          modes(
            mode,
            () => {
              if (value) {
                setValue(deck.cue_default, 1);
              } else {
                setValue(deck.cue_default, 0);
              }
            },
            () => value && setValue(deck.cue_set, 1)
          );
        }),
    },
    cueIndicator: {
      type: 'control',
      target: deck.cue_indicator,
      update:
        ({
          bindings: {
            cue: { control },
          },
          context: { device },
        }: Control<Type>) =>
        ({ value }: ControlMessage) => {
          if (value) {
            device.sendColor(control, device.colors.hi_red);
          } else if (!value) {
            device.clearColor(control);
          }
        },
    },
  },
});

export default make;
