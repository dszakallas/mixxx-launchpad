import type { ChannelControlDef, MidiMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { ButtonBindingTemplate, MakeDeckControlTemplate, Control, midi } from '../Control'
import { onAttack } from '../util'

export type Type = {
  type: 'loopMultiply'
  bindings: {
    halve: ButtonBindingTemplate<Type>
    double: ButtonBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const onMount =
    (k: 'halve' | 'double') =>
    ({ context: { device }, bindings }: Control<Type>) =>
    () => {
      device.sendColor(bindings[k].control, device.colors.lo_yellow)
    }
  const onMidi = (k: 'double' | 'halve') => (_: Control<Type>) =>
    onAttack((_: MidiMessage) => setValue(deck[`loop_${k}`], 1))
  return {
    bindings: {
      halve: {
        type: midi(gridPosition),
        listeners: {
          mount: onMount('halve'),
          midi: onMidi('halve'),
        },
      },
      double: {
        type: midi([gridPosition[0] + 1, gridPosition[1]]),
        listeners: {
          mount: onMount('double'),
          midi: onMidi('double'),
        },
      },
    },
  }
}

export default make
