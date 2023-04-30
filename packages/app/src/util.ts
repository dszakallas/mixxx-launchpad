import { MidiMessage } from "@mixxx-launchpad/mixxx"

export const posMod = (x: number, n: number): number => ((x % n) + n) % n

export const range = (n: number) => [...Array(n).keys()]

export const onAttack = (handler: (m: MidiMessage) => void): ((m: MidiMessage) => void) => ((m: MidiMessage) => {
  if (m.value) handler(m)
})
