import type {
  ControlComponent,
  ControlMessage,
  MidiComponent,
  MidiMessage,
} from '@mixxx-launchpad/mixxx';
import { getValue, setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';
import { modes } from '../ModifierSidebar';

const range = (n: number) => [...Array(n).keys()]

export type Type = {
  type: 'hotcue';
  params: {
    cues: number;
    rows: number;
    start?: number;
  };
  bindings: {
    [k: `b.${string}`]: MidiComponent;
    [k: `c.${string}`]: ControlComponent;
  };
  state: Record<string, unknown>;
};

const make: MakeControlTemplate<Type> = ({ cues, rows, start = 0 }, gridPosition, deck) => {
  const onHotcueMidi =
    (i: number) =>
    ({ context: { modifier }, bindings }: Control<Type>) =>
    ({ value }: MidiMessage) => {
      modes(
        modifier.getState(),
        () => {
          if (value) {
            setValue(deck.hotcues[1 + i + start].activate, 1);
          } else {
            setValue(deck.hotcues[1 + i + start].activate, 0);
          }
        },
        () => {
          if (value) {
            if (getValue(bindings[`c.${i}`].control)) {
              setValue(deck.hotcues[1 + i + start].clear, 1);
            } else {
              setValue(deck.hotcues[1 + i + start].set, 1);
            }
          }
        }
      );
    };
  const onHotcueEnabled =
    (i: number) =>
    ({ context: { device }, bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      if (value) {
        device.sendColor(bindings[`b.${i}`].control, device.colors.lo_yellow);
      } else {
        device.clearColor(bindings[`b.${i}`].control);
      }
    };
  const bindings: { [k: string]: any } = {};
  range(cues).map((i) => {
    const dx = i % rows;
    const dy = ~~(i / rows);
    bindings[`b.${i}`] = {
      type: 'button',
      target: [gridPosition[0] + dx, gridPosition[1] + dy],
      midi: onHotcueMidi(i),
    };
    bindings[`c.${i}`] = {
      type: 'control',
      target: deck.hotcues[1 + i + start].enabled,
      update: onHotcueEnabled(i),
    };
  });
  return {
    bindings,
    state: {},
  };
};

export default make;
