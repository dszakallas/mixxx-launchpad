import type { ChannelControlDef, MidiMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { MidiComponent } from '../device'
import { ButtonBindingTemplate, MakeDeckControlTemplate, Control } from '../Control'
import { modes } from '../ModifierSidebar'

export type Type = {
  type: 'grid'
  bindings: {
    back: ButtonBindingTemplate<Type>
    forth: ButtonBindingTemplate<Type>
  }
  state: Record<string, unknown>
  params: {
    deck: ChannelControlDef,
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
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
        type: MidiComponent,
        target: gridPosition,
        listeners: {
          midi: onGrid('back'),
        }
      },
      forth: {
        type: MidiComponent,
        target: [gridPosition[0] + 1, gridPosition[1]],
        listeners: {
          midi: onGrid('forth'),
        }
      },
    }
  }
}

export default make
