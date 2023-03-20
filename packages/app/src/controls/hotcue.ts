import type {
  ControlComponent,
  ControlMessage,
  MidiComponent,
  MidiMessage,
} from '@mixxx-launchpad/mixxx';
import { getValue, setValue } from '@mixxx-launchpad/mixxx';
import { RGBColor } from '..';
import { Control, MakeControlTemplate } from '../Control';
import { modes } from '../ModifierSidebar';
import { range } from '../util'

const parseHotcueValue = (number: number): RGBColor => {
  const blue = number % 256
  const green = (number >> 8) % 256
  const red = (number >> 16) % 256
  return [red, green, blue]
}

export type Type = {
  type: 'hotcue';
  params: {
    cues: number;
    rows: number;
    start?: number;
  };
  bindings: {
    [k: `midi.${string}`]: MidiComponent;
    [k: `cue.${string}`]: ControlComponent;
    [k: `color.${string}`]: ControlComponent;
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
            if (getValue(bindings[`cue.${i}`].control)) {
              setValue(deck.hotcues[1 + i + start].clear, 1);
            } else {
              setValue(deck.hotcues[1 + i + start].set, 1);
            }
          }
        }
      );
    };
  const onHotcueColorChanged =
    (i: number) => 
    ({ context: { device }, bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      if (device.supportsRGBColors) {
        device.sendRGBColor(
          bindings[`midi.${i}`].control,
          parseHotcueValue(value)
        );
      }
    }
  const onHotcueEnabled =
    (i: number) =>
    ({ context: { device }, bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      if (value) {
        if (device.supportsRGBColors) {
          device.sendRGBColor(
            bindings[`midi.${i}`].control,
            parseHotcueValue(getValue(deck.hotcues[1 + i + start].color))
          );
        } else {
          device.sendColor(bindings[`midi.${i}`].control, device.colors.lo_yellow);
        }
      } else {
        device.clearColor(bindings[`midi.${i}`].control);
      }
    };
  const bindings: { [k: string]: any } = {};
  range(cues).map((i) => {
    const dx = i % rows;
    const dy = ~~(i / rows);
    bindings[`midi.${i}`] = {
      type: 'button',
      target: [gridPosition[0] + dx, gridPosition[1] + dy],
      midi: onHotcueMidi(i),
    };
    bindings[`cue.${i}`] = {
      type: 'control',
      target: deck.hotcues[1 + i + start].enabled,
      update: onHotcueEnabled(i),
    };
    bindings[`color.${i}`] = {
      type: 'control',
      target: deck.hotcues[1 + i + start].color,
      update: onHotcueColorChanged(i),
    }
  });
  return {
    bindings,
    state: {},
  };
};

export default make;
