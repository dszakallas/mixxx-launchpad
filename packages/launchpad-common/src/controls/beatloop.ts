import type { ControlComponent, ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { MidiComponent } from '../device'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'beatloop'
  params: {
    loops: readonly number[]
    rows: number
  }
  state: Record<string, unknown>
  bindings: {
    [k: `b.${string}`]: MidiComponent
    [k: `c.${string}`]: ControlComponent
  }
}

const make: MakeDeckControlTemplate<Type> = (params, gridPosition, deck) => {
  const { loops, rows } = params
  const bindings: { [k: string]: any } = {}
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
      type: 'button',
      target: [gridPosition[0] + dx, gridPosition[1] + dy],
      midi: onMidi(loop),
    }
    bindings[`c.${loop}`] = {
      type: 'control',
      target: deck.beatloops[loop].enabled,
      update: onUpdate(i),
    }
  })

  return {
    bindings,
    state: {},
  }
}

export default make
