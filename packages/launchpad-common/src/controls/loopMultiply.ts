import type { MidiMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { MidiComponent } from '../device'
import { onAttack } from '../util'

export type Type = {
  type: 'loopMultiply'
  bindings: {
    halve: MidiComponent
    double: MidiComponent
  }
  state: Record<string, unknown>
  params: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => {
  const onMount =
    (k: 'halve' | 'double') =>
    ({ context: { device }, bindings }: Control<Type>) =>
    () => {
      device.sendColor(bindings[k].control, device.colors.lo_yellow)
    }
  const onMidi = (k: 'double' | 'halve') => (_: Control<Type>) => onAttack((_: MidiMessage) => setValue(deck[`loop_${k}`], 1))
  return {
    state: {},
    bindings: {
      halve: {
        type: 'button',
        target: gridPosition,
        mount: onMount('halve'),
        midi: onMidi('halve'),
      },
      double: {
        type: 'button',
        target: [gridPosition[0] + 1, gridPosition[1]],
        mount: onMount('double'),
        midi: onMidi('double'),
      },
    },
  }
}

export default make
