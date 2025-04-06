export type MidiControlDef = {
  status: number
  midino: number
  name: string
}

export type MidiMessage = {
  value: number
  control: MidiControlDef
}
