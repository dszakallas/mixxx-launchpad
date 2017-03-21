import { midi } from '../Mixxx/globals'
import buttons from '@mixxx-launchpad/mk-specs/buttons'
import colors from '@mixxx-launchpad/mk-specs/colors'

export const Button = {
  send (button, value) {
    midi.sendShortMsg(button[0], button[1], value)
  },
  buttons,
  colors
}
