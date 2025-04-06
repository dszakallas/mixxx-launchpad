import { Modifier, ModifierState } from './Modifier'

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

export const retainAttackMode = (modifier: Modifier, cb: (ms: ModifierState, mm: MidiMessage) => void) => {
  let state = ModifierState.None

  return function (data: MidiMessage) {
    if (data.value) {
      state = modifier.getState()
    }
    return cb(state, data)
  }
}
