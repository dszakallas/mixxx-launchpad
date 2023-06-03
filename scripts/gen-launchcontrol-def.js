#!/usr/bin/env node

const controls = {}

const range = (n) => [...Array(n).keys()]

const CC = 0xB
const NoteOn = 0x9
const Note = [NoteOn, 0x8]

const Sets = {
  knob: {
    set: [0x0D, 0x1D, 0x31],
    n: 8,
    nPerRow: 1,
    type: CC,
  },
  // the leds are in a different order than the knobs, also they use NoteOn instead of CC
  // see https://cycling74.com/forums/how-to-control-leds-on-novation-launch-control-xl-buttons#reply-5ac7c5b288b16e5d73805c55
  led: {
    set: [0x0D, 0x1D, 0x2D, 0x3D, 0x4D, 0x5D, 0x6D, 0x7D],
    n: 3,
    nPerRow: 1,
    transpose: true,
    type: NoteOn,
  },
  fader: {
    set: [0x4D],
    n: 8,
    nPerRow: 1,
    type: CC,
  },
  pad: {
    set: [0x29, 0x39, 0x49, 0x59],
    n: 4,
    nPerRow: 2,
    type: Note,
  },
}

const sidebar = {
  up: [CC, 0x68],
  down: [CC, 0x69],
  left: [CC, 0x6A],
  right: [CC, 0x6B],
  device: [Note, 0x69],
  mute: [Note, 0x6a],
  solo: [Note, 0x6b],
  arm: [Note, 0x6c],
}

const board = Object.fromEntries(Object.entries(Sets).flatMap(([name, {set, n, nPerRow, type, transpose}]) =>
  range(set.length * n).map((x) => {
    const r = ~~(x / (n * nPerRow))
    const c = x % (n * nPerRow)
    const index = transpose ? `${c}.${r}` : `${r}.${c}`
    return [`${name}.${index}`, [type, set[~~(x / n)] + x % n]]
  })
))

const page = Object.assign({}, sidebar, board, { reset: [CC, 0x0] })

const toStatus = (opcode, channel) => opcode * 16 + channel

const makePage = (i) => {
  return Object.entries(page).flatMap(([name, [type, ctrl]]) => {
    if (typeof type === 'number') {
      return [[`${i}.${name}`, [toStatus(type, i), ctrl]]]
    } else {
      const [on, off] = type
      return [[`${i}.${name}.on`, [toStatus(on, i), ctrl]], [`${i}.${name}.off`, [toStatus(off, i), ctrl]]]
    }
  })
}

const def = {
  device: 'LaunchControl XL MK2',
  manufacturer: 'Novation',
  global: 'NLCXL2',
  sysex: true,
  controls: Object.fromEntries(range(16).flatMap((n) => makePage(n))),
}

console.log(JSON.stringify(def))
