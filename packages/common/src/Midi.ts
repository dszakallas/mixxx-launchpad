export type MidiControlDef = {
  status: number
  midino: number
  name: string
}

export type MidiMessage = {
  value: number
  control: MidiControlDef
}

export const onAttack =
  (handler: (m: MidiMessage) => void): ((m: MidiMessage) => void) =>
  (m: MidiMessage) => {
    if (m.value) handler(m)
  }
