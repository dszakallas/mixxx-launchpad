import { midi } from '../Mixxx/globals'
import { buttons } from './buttons'
import { colors } from './colors'

export const Button = {
  send (button, value) {
    midi.sendShortMsg(button[0], button[1], value)
  },
  buttons,
  colors
}
