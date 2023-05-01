import { modes } from '../ModifierSidebar'
import type { MidiComponent, MidiMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { onAttack } from '../util'

export type Type = {
  type: 'loopjumpSmall'
  bindings: {
    back: MidiComponent
    forth: MidiComponent
  }
  params: {
    amount: number
  }
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = ({ amount }, button, deck) => {
  const onMidi =
    (dir: number) =>
    ({ context: { modifier } }: Control<Type>) =>
    onAttack((_: MidiMessage) => modes(modifier.getState(), () => setValue(deck.loop_move, dir * amount)))
  return {
    state: {},
    bindings: {
      back: {
        type: 'button',
        target: button,
        midi: onMidi(-1),
        mount:
          ({ context: { device }, bindings }: Control<Type>) =>
          () => {
            device.sendColor(bindings.back.control, device.colors.hi_yellow)
          },
      },
      forth: {
        type: 'button',
        target: [button[0] + 1, button[1]],
        midi: onMidi(1),
        mount:
          ({ context: { device }, bindings }: Control<Type>) =>
          () => {
            device.sendColor(bindings.forth.control, device.colors.hi_yellow)
          },
      },
    },
  }
}

export default make
