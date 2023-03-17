import type { ControlComponent, ControlMessage, MidiComponent } from '@mixxx-launchpad/mixxx';
import { setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';
import { modes } from '../ModifierSidebar';

export type Type = {
  type: 'beatloop';
  params: {
    loops: readonly number[];
    rows: number;
  };
  state: Record<string, unknown>;
  bindings: {
    [k: `b.${string}`]: MidiComponent;
    [k: `c.${string}`]: ControlComponent;
  };
};

const make: MakeControlTemplate<Type> =
  (params, gridPosition, deck, ) => {
  const { loops, rows } = params;
  const bindings: { [k: string]: any } = {};
  const onAttack =
    (loop: number) =>
    ({ context }: Control<Type>) =>
    () => {
      const { modifier } = context;
      modes(modifier.getState(), () =>
        setValue(deck.beatloops[loop].toggle, 1)
      );
    };

  const onUpdate =
    (i: number) =>
    ({ context, bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      const { device } = context;
      const color = value ? device.colors.hi_red : device.colors.lo_red;
      device.sendColor(bindings[`b.${i}`].control, color);
    };

  loops.forEach((loop, i) => {
    const dx = i % rows;
    const dy = ~~(i / rows);
    bindings[`b.${i}`] = {
      type: 'button',
      target: [gridPosition[0] + dx, gridPosition[1] + dy],
      attack: onAttack(loop),
    };
    bindings[`c.${loop}`] = {
      type: 'control',
      target: deck.beatloops[loop].enabled,
      update: onUpdate(i),
    };
  });

  return {
    bindings,
    state: {},
  };
};

export default make;
