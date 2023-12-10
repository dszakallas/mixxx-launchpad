import { ChannelControlDef, ControlComponent, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { LaunchpadDevice, MidiComponent } from '../device'
import { ButtonBindingTemplate, ControlBindingTemplate, MakeDeckControlTemplate, Control } from '../Control'
import { modes } from '../ModifierSidebar'
import { onAttack } from '../util'

export type Type = {
  type: 'load'
  bindings: {
    samples: ControlBindingTemplate<Type>
    play: ControlBindingTemplate<Type>
    button: ButtonBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const onStateChanged = (loaded: number, playing: number, bindings: Control<Type>['bindings'], device: LaunchpadDevice) => {
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
        type: ControlComponent,
        target: deck.track_samples,
        listeners: {

          update:
            ({ bindings, context: { device } }: Control<Type>) =>
              ({ value }: ControlMessage) =>
                onStateChanged(value, getValue(bindings.play.control), bindings, device),
        }
      },
      play: {
        type: ControlComponent,
        target: deck.play,
        listeners: {
          update:
            ({ bindings, context: { device } }: Control<Type>) =>
              ({ value }: ControlMessage) =>
                onStateChanged(getValue(bindings.samples.control), value, bindings, device),
        }
      },
      button: {
        type: MidiComponent,
        target: gridPosition,
        listeners: {
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
        }
      },
    },
  }
}

export default make
