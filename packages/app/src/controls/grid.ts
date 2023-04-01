import type { MidiComponent, MidiMessage } from '@mixxx-launchpad/mixxx'
import { setValue } from '@mixxx-launchpad/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { modes } from '../ModifierSidebar'

export type Type = {
  type: 'grid'
  bindings: {
    back: MidiComponent
    forth: MidiComponent
  }
  state: Record<string, unknown>
  params: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => {
  const steps = {
    back: {
      normal: deck.beats_translate_earlier,
      ctrl: deck.beats_adjust_slower,
    },
    forth: {
      normal: deck.beats_translate_later,
      ctrl: deck.beats_adjust_faster,
    },
  }
  const onGrid =
    (dir: 'back' | 'forth') =>
    ({ context: { device, modifier }, bindings }: Control<Type>) =>
    ({ value }: MidiMessage) => {
      if (!value) {
        device.clearColor(bindings[dir].control)
      } else {
        modes(
          modifier.getState(),
          () => {
            device.sendColor(bindings[dir].control, device.colors.hi_yellow)
            setValue(steps[dir].normal, 1)
          },
          () => {
            device.sendColor(bindings[dir].control, device.colors.hi_amber)
            setValue(steps[dir].ctrl, 1)
          },
        )
      }
    }
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
    state: {} 
  }
}

export default make
