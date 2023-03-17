import { modes } from '../ModifierSidebar';
import type {
  ControlComponent,
  ControlMessage, MidiComponent,
} from '@mixxx-launchpad/mixxx';
import { setValue } from '@mixxx-launchpad/mixxx';
import { Control, MakeControlTemplate } from '../Control';
import Bpm from '../Bpm';

export type Type = {
  type: 'tap'
  bindings: {
    tap: MidiComponent,
    beat: ControlComponent
  },
  params: Record<string, unknown>,
  state: Record<string, unknown>
}

const make: MakeControlTemplate<Type> = (_, gridPosition, deck) => {
  const tempoBpm = new Bpm()
  tempoBpm.on('tap', (avg: number) => {
    setValue(deck.bpm, avg)
  })
  return {
    state: {},
    bindings: {
      tap: {
        type: 'button',
        target: gridPosition,
        attack:
          ({ context: { modifier } }: Control<Type>) =>
          () => {
          modes(modifier.getState(),
            () => tempoBpm.tap(),
            () => setValue(deck.bpm_tap, 1),
            () => setValue(deck.beats_translate_curpos, 1),
            () => setValue(deck.beats_translate_match_alignment, 1)
          )
        }
      },
      beat: {
        type: 'control',
        target: deck.beat_active,
        update:
        ({ context: { device }, bindings }: Control<Type>) =>
        ({ value }: ControlMessage) => {
          if (value) {
            device.sendColor(bindings.tap.control, device.colors.hi_red)
          } else {
            device.clearColor(bindings.tap.control)
          }
        }
      }
    }
  }
}

export default make
