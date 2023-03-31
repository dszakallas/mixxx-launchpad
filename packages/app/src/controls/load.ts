import type { ControlComponent, ControlMessage, MidiComponent } from '@mixxx-launchpad/mixxx'
import { getValue, setValue } from '@mixxx-launchpad/mixxx'
import { Control, MakeDeckControlTemplate } from '../Control'
import { LaunchpadDevice } from '../.'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'load'
  bindings: {
    samples: ControlComponent
    play: ControlComponent
    button: MidiComponent
  }
  params: Record<string, unknown>
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = (_, gridPosition, deck) => {
  const onStateChanged = (loaded: number, playing: number, bindings: Type['bindings'], device: LaunchpadDevice) => {
    if (loaded && playing) {
      device.sendColor(bindings.button.control, device.colors.lo_red)
    } else if (loaded) {
      device.sendColor(bindings.button.control, device.colors.lo_yellow)
    } else {
      device.sendColor(bindings.button.control, device.colors.lo_green)
    }
  }
  return {
    state: {},
    bindings: {
      samples: {
        type: 'control',
        target: deck.track_samples,
        update:
          ({ bindings, context: { device } }: Control<Type>) =>
          ({ value }: ControlMessage) =>
            onStateChanged(value, getValue(bindings.play.control), bindings, device),
      },
      play: {
        type: 'control',
        target: deck.play,
        update:
          ({ bindings, context: { device } }: Control<Type>) =>
          ({ value }: ControlMessage) =>
            onStateChanged(getValue(bindings.samples.control), value, bindings, device),
      },
      button: {
        type: 'button',
        target: gridPosition,
        midi:
          ({ bindings, context: { modifier } }: Control<Type>) =>
          onAttack(() => {
            modes(
              modifier.getState(),
              () => {
                if (!getValue(bindings.samples.control)) {
                  setValue(deck.LoadSelectedTrack, 1)
                }
              },
              () => setValue(deck.LoadSelectedTrack, 1),
              () => setValue(deck.eject, 1),
            )
          }),
      },
    },
  }
}

export default make
