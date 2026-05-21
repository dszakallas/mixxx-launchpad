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
  const onStateChanged = (
    loaded: number,
    playing: number,
    bindings: Control<Type>['bindings'],
    colorPalette: Control<Type>['context']['colorPalette'],
  ) => {
    if (loaded && playing) {
      bindings.button.sendPaletteColor(colorPalette.getColor(0, 0)) // Red dim (loaded + playing)
    } else if (loaded) {
      bindings.button.sendPaletteColor(colorPalette.getColor(2, 0)) // Yellow dim (loaded)
    } else {
      bindings.button.sendPaletteColor(colorPalette.getColor(3, 0)) // Green dim (empty)
    }
  }
  return {
    bindings: {
      samples: {
        type: control(deck.track_samples),
        listeners: {
          update:
            ({ bindings, context: { colorPalette } }: Control<Type>) =>
            ({ value }: ControlMessage) =>
              onStateChanged(value, getValue(bindings.play.control), bindings, colorPalette),
        },
      },
      play: {
        type: control(deck.play),
        listeners: {
          update:
            ({ bindings, context: { colorPalette } }: Control<Type>) =>
            ({ value }: ControlMessage) =>
              onStateChanged(getValue(bindings.samples.control), value, bindings, colorPalette),
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
