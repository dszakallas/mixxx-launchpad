import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import {
  ButtonBindingTemplate,
  ControlBindingTemplate,
  MakeDeckControlTemplate,
  Control,
  midi,
  control,
} from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'beatloop'
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
    loops: readonly number[]
    rows: number
  }
  bindings: {
    [k: `b.${string}`]: ButtonBindingTemplate<Type>
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
    ({ context, bindings }: Control<Type>) =>
    ({ value }: ControlMessage) => {
      const { device } = context
      const color = value ? device.colors.hi_red : device.colors.lo_red
      device.sendColor(bindings[`b.${i}`].control, color)
    }

  loops.forEach((loop, i) => {
    const dx = i % rows
    const dy = ~~(i / rows)
    bindings[`b.${i}`] = {
      type: midi([gridPosition[0] + dx, gridPosition[1] + dy]),
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
