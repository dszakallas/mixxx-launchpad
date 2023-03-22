import type {
    ControlComponent, ControlMessage, MidiComponent, MidiMessage
} from '@mixxx-launchpad/mixxx';
import { getValue, setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeDeckControlTemplate } from '../Control';
import { modes } from '../ModifierSidebar';

export type Type = {
  type: 'quantize';
  params: Record<string, unknown>;
  state: Record<string, unknown>;
  bindings: {
    quantize: ControlComponent;
    button: MidiComponent;
  };
};

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => ({
  state: {},
  bindings: {
    quantize: {
      type: 'control',
      target: deck.quantize,
      update:
        ({ bindings, context: { device } }: Control<Type>) =>
        ({ value }: ControlMessage) =>
          value
            ? device.sendColor(bindings.button.control, device.colors.hi_orange)
            : device.clearColor(bindings.button.control),
    },
    button: {
      type: 'button',
      target: gridPosition,
      attack:
        ({ bindings, context: { modifier } }: Control<Type>) =>
        (_: MidiMessage) =>
          modes(modifier.getState(), () =>
            setValue(
              bindings.quantize.control,
              Number(!getValue(bindings.quantize.control))
            )
          ),
    },
  },
});

export default make;
