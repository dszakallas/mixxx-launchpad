import { MidiMessage } from '@mixxx-launch/common/midi'

export const onAttack =
  (handler: (m: MidiMessage) => void): ((m: MidiMessage) => void) =>
  (m: MidiMessage) => {
    if (m.value) handler(m)
  }
