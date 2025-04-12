import type { ChannelControlDef } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { PadBindingTemplate, MakeDeckControlTemplate, Control, cellPad } from '../Control'
import { MidiMessage, onAttack } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'loopMultiply'
  bindings: {
    halve: PadBindingTemplate<Type>
    double: PadBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const onMount =
    (k: 'halve' | 'double') =>
    ({ bindings }: Control<Type>) =>
    () => {
      bindings[k].sendColor(Color.YellowLow)
    }
  const onMidi = (k: 'double' | 'halve') => (_: Control<Type>) =>
    onAttack((_: MidiMessage) => setValue(deck[`loop_${k}`], 1))
  return {
    bindings: {
      halve: {
        type: cellPad(gridPosition),
        listeners: {
          mount: onMount('halve'),
          midi: onMidi('halve'),
        },
      },
      double: {
        type: cellPad([gridPosition[0] + 1, gridPosition[1]]),
        listeners: {
          mount: onMount('double'),
          midi: onMidi('double'),
        },
      },
    },
  }
}

export default make
