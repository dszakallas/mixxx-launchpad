import { MidiMessage } from '@mixxx-launch/mixxx'

export const onAttack =
  (handler: (m: MidiMessage) => void): ((m: MidiMessage) => void) =>
  (m: MidiMessage) => {
    if (m.value) handler(m)
  }
