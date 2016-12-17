import { midi } from '../Mixxx/globals'

export function test () {
  midi.sendShortMsg(0xb0, 0x0, 0x7F)
}

export function reset () {
  midi.sendShortMsg(0xb0, 0x0, 0x0)
}

export { Button } from './Button'

export { MidiBus } from './MidiBus'
