import type {
  ControlDef,
  MidiComponent,
  MidiMessage,
} from '@mixxx-launchpad/mixxx';
import { setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';
import { modes } from '../ModifierSidebar';

export type Type = {
  type: 'grid';
  bindings: {
    back: MidiComponent;
    forth: MidiComponent;
  };
  state: {
    back: {
      normal: ControlDef;
      ctrl: ControlDef;
    };
    forth: {
      normal: ControlDef;
      ctrl: ControlDef;
    };
  };
  params: Record<string, unknown>;
};

const make: MakeControlTemplate<Type> = (_, gridPosition, deck) => {
  const onGrid =
    (dir: 'back' | 'forth') =>
    ({
      context: { device, modifier },
      bindings,
      state,
    }: Control<Type>) =>
    ({ value }: MidiMessage) => {
      if (!value) {
        device.clearColor(bindings[dir].control);
      } else {
        modes(
          modifier.getState(),
          () => {
            device.sendColor(bindings[dir].control, device.colors.hi_yellow);
            setValue(state[dir].normal, 1);
          },
          () => {
            device.sendColor(bindings[dir].control, device.colors.hi_amber);
            setValue(state[dir].ctrl, 1);
          }
        );
      }
    };
  return {
    bindings: {
      back: {
        type: 'button',
        target: gridPosition,
        midi: onGrid('back'),
      },
      forth: {
        type: 'button',
        target: [gridPosition[0] + 1, gridPosition[1]],
        midi: onGrid('forth'),
      },
    },
    state: {
      back: {
        normal: deck.beats_translate_earlier,
        ctrl: deck.beats_adjust_slower,
      },
      forth: {
        normal: deck.beats_translate_later,
        ctrl: deck.beats_adjust_faster,
      },
    },
  };
};

export default make;
