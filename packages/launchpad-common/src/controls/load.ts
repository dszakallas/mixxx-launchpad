import { ChannelControlDef, ControlMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
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
  type: 'load'
  bindings: {
    samples: ControlBindingTemplate<Type>
    play: ControlBindingTemplate<Type>
    button: PadBindingTemplate<Type>
  }
  params: {
    deck: ChannelControlDef
    gridPosition: [number, number]
  }
}

const make: MakeDeckControlTemplate<Type> = ({ gridPosition, deck }) => {
  const onStateChanged = (loaded: number, playing: number, bindings: Control<Type>['bindings']) => {
    if (loaded && playing) {
      bindings.button.sendColor(Color.RedLow)
    } else if (loaded) {
      bindings.button.sendColor(Color.YellowLow)
    } else {
      bindings.button.sendColor(Color.GreenLow)
    }
  }
  return {
    bindings: {
      samples: {
        type: control(deck.track_samples),
        listeners: {
          update:
            ({ bindings }: Control<Type>) =>
            ({ value }: ControlMessage) =>
              onStateChanged(value, getValue(bindings.play.control), bindings),
        },
      },
      play: {
        type: control(deck.play),
        listeners: {
          update:
            ({ bindings }: Control<Type>) =>
            ({ value }: ControlMessage) =>
              onStateChanged(getValue(bindings.samples.control), value, bindings),
        },
      },
      button: {
        type: cellPad(gridPosition),
        listeners: {
          midi: ({ bindings, context: { modifier } }: Control<Type>) =>
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
    },
  }
}

export default make
