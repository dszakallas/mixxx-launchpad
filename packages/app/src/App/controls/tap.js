import { Button } from '../../Launchpad'
import { Control } from '../../Mixxx'
import modes from '../../Utility/modes'
import Bpm from '../../App/Bpm'

export default (button) => (deck) => {
  const tempoBpm = new Bpm()
  tempoBpm.on('tap', (avg) => {
    Control.setValue(deck.bpm, avg)
  })
  return {
    bindings: {
      tap: {
        type: 'button',
        target: button,
        attack: ({ context }) => {
          modes(context,
            () => {
              tempoBpm.tap()
            },
            undefined,
            () => {
              Control.setValue(deck.beats_translate_curpos, 1)
            },
            () => {
              Control.setValue(deck.beats_translate_match_alignment, 1)
            }
          )
        }
      },
      beat: {
        type: 'control',
        target: deck.beat_active,
        update: ({ value }, { bindings }) => {
          if (value) {
            Button.send(bindings.tap.button, Button.colors.hi_red)
          } else {
            Button.send(bindings.tap.button, Button.colors.black)
          }
        }
      }
    }
  }
}
