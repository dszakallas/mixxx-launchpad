import { Control, console } from '../../Mixxx'
import { Button } from '../../Launchpad'
import { modes } from '../../Utility/modes'

export const load = (button) => (deck) => {
  const onStateChanged = (loaded, playing, bindings) => {
    if (loaded && playing) {
      Button.send(bindings.button.button, Button.colors.lo_red)
    } else if (loaded) {
      Button.send(bindings.button.button, Button.colors.lo_amber)
    } else {
      Button.send(bindings.button.button, Button.colors.lo_green)
    }
  }
  return {
    bindings: {
      samples: {
        type: 'control',
        target: deck.track_samples,
        update: ({ value }, { bindings }) =>
          onStateChanged(value, bindings.play.getValue(), bindings)
      },
      play: {
        type: 'control',
        target: deck.play,
        update: ({ value }, { bindings }) =>
          onStateChanged(bindings.samples.getValue(), value, bindings)
      },
      button: {
        type: 'button',
        target: button,
        attack: ({ context }, { bindings }) => {
          modes(context,
            () => {
              if (!bindings.samples.getValue()) {
                Control.setValue(deck.LoadSelectedTrack, 1)
              }
            },
            () => Control.setValue(deck.LoadSelectedTrack, 1),
            () => Control.setValue(deck.eject, 1)
          )
        }
      }
    }
  }
}
