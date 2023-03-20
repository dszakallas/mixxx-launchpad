import type {
    MidiComponent
} from '@mixxx-launchpad/mixxx';
import { setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';
import { posMod } from '../util';
import { modes, retainAttackMode } from '../ModifierSidebar';

export type Type = {
  type: 'loopjump';

  bindings: {
    [k: number]: MidiComponent;
  };
  params: {
    jumps: readonly [number, number][];
    vertical?: boolean;
  };
  state: {
    mode: boolean;
    pressing: number | null;
    diff: number;
    set: number;
    color: string[];
  };
};

const make: MakeControlTemplate<Type> = ({ jumps, vertical = false }, gridPosition, deck) => {
  const bindings: { [k: number]: any } = {};
  const onMidi =
    (k: number, j: [number, number], d: number) =>
    ({ context: { modifier, device }, bindings, state }: Control<Type>) =>
      retainAttackMode(modifier, (mode, { value }) => {
        modes(
          mode,
          () => {
            if (!state.mode) {
              if (value) {
                setValue(deck.loop_move, j[state.set] * d);
              }
            } else {
              if (value) {
                const currentJump = j[state.set] * d;

                setValue(deck.loop_move, currentJump);
                if (state.pressing != null) {
                  device.sendColor(
                    bindings[state.pressing].control,
                    device.colors[`lo_${state.color[state.set]}`]
                  );
                }
                device.sendColor(
                  bindings[k].control,
                  device.colors[`hi_${state.color[state.set]}`]
                );
                state.pressing = k;
                state.diff = state.diff + currentJump;
              } else {
                if (state.pressing === k) {
                  device.sendColor(
                    bindings[k].control,
                    device.colors[`lo_${state.color[state.set]}`]
                  );
                  state.pressing = null;
                  setValue(deck.loop_move, -state.diff);
                  state.diff = 0;
                }
              }
            }
          },
          () => {
            if (value) {
              state.set = posMod(state.set + 1, 2);
              const prefix = state.mode ? 'lo' : 'hi';
              for (let b = 0; b < spec.length; ++b) {
                device.sendColor(
                  bindings[b].control,
                  device.colors[`${prefix}_${state.color[state.set]}`]
                );
              }
            }
          },
          () => {
            if (value) {
              state.mode = !state.mode;
              const prefix = state.mode ? 'lo' : 'hi';
              for (let b = 0; b < spec.length; ++b) {
                device.sendColor(
                  bindings[b].control,
                  device.colors[`${prefix}_${state.color[state.set]}`]
                );
              }
            }
          }
        );
      });
  const onMount =
    (k: number) =>
    ({ context: { device }, bindings, state }: Control<Type>) =>
    () => {
      const prefix = state.mode ? 'lo' : 'hi';
      device.sendColor(
        bindings[k].control,
        device.colors[`${prefix}_${state.color[state.set]}`]
      );
    };
  const spec = jumps.flatMap((j) => [
    [j, 1],
    [j, -1],
  ]);

  spec.forEach(([jump, dir], i) => {
    bindings[i] = {
      type: 'button',
      target: vertical
        ? [gridPosition[0] + (i % 2), gridPosition[1] + ~~(i / 2)]
      : [gridPosition[0] + ~~(i / 2), gridPosition[1] + (i % 2)],
      midi: onMidi(i, jump as [number, number], dir as number),
      mount: onMount(i),
    };
  });
  return {
    bindings,
    state: {
      mode: false,
      pressing: null,
      diff: 0,
      set: 0,
      color: ['green', 'red'],
    },
  };
};

export default make;
