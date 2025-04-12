import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'
import { modes } from '@mixxx-launch/common/modifier'
import { onAttack } from '@mixxx-launch/common/midi'
import { Color } from '@mixxx-launch/launch-common'

export type Type = {
  type: 'beatloop'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    loops: readonly number[]
    rows: number
  }
  bindings: {
    [k: `b.${string}`]: PadBindingTemplate<Type>
    [k: `c.${string}`]: ControlBindingTemplate<Type>
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck, loops, rows }) => {
  const bindings: Type['bindings'] = {}
  const onMidi =
    (loop: number) =>
    ({ context }: Control<Type>) =>
      onAttack(() => {
        const { modifier } = context
        modes(modifier.getState(), () => setValue(deck.beatloops[loop].toggle, 1))
      })

  const onUpdate =
    (i: number) =>
    ({ bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      const color = value ? Color.RedHi : Color.RedLow
      bindings[`b.${i}`].sendColor(color)
    }

  loops.forEach((loop, i) => {
    const dx = i % rows
    const dy = ~~(i / rows)
    bindings[`b.${i}`] = {
      type: cellPad([gridPosition[0] + dx, gridPosition[1] + dy]),
      listeners: {
        midi: onMidi(loop),
      },
    }
    bindings[`c.${loop}`] = {
      type: control(deck.beatloops[loop].enabled),
      listeners: {
        update: onUpdate(i),
      },
    }
  })

  return { bindings }
}

export default make
