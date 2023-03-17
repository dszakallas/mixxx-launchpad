import type { MidiComponent, MidiMessage } from '@mixxx-launchpad/mixxx';
import { setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';

export type Type = {
  type: 'loopMultiply';
  bindings: {
    halve: MidiComponent;
    double: MidiComponent;
  };
  state: Record<string, unknown>;
  params: Record<string, unknown>;
};

const make: MakeControlTemplate<Type> = (_, gridPosition, deck) => {
  const onMount =
    (k: 'halve' | 'double') =>
    ({ context: { device }, bindings }: Control<Type>) =>
    () => {
      device.sendColor(bindings[k].control, device.colors.lo_yellow);
    };
  const onAttack =
    (k: 'double' | 'halve') => (_: Control<Type>) => (_: MidiMessage) => {
      setValue(deck[`loop_${k}`], 1);
    };
  return {
    state: {},
    bindings: {
      halve: {
        type: 'button',
        target: gridPosition,
        mount: onMount('halve'),
        attack: onAttack('halve'),
      },
      double: {
        type: 'button',
        target: [gridPosition[0] + 1, gridPosition[1]],
        mount: onMount('double'),
        attack: onAttack('double'),
      },
    },
  };
};

export default make;
