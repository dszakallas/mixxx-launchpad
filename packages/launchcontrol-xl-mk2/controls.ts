const range = (n: number) => [...Array(n).keys()]

const CC = 0xb
const NoteOn = 0x9
const Note = [NoteOn, 0x8]

const Sets = {
  knob: {
    set: [0x0d, 0x1d, 0x31],
    n: 8,
    nPerRow: 1,
    transpose: false,
    type: CC,
  },
  // the leds are in a different order than the knobs, also they use NoteOn instead of CC
  // see https://cycling74.com/forums/how-to-control-leds-on-novation-launch-control-xl-buttons#reply-5ac7c5b288b16e5d73805c55
  led: {
    set: [0x0d, 0x1d, 0x2d, 0x3d, 0x4d, 0x5d, 0x6d, 0x7d],
    n: 3,
    nPerRow: 1,
    transpose: true,
    type: NoteOn,
  },
  fader: {
    set: [0x4d],
    n: 8,
    nPerRow: 1,
    transpose: false,
    type: CC,
  },
  pad: {
    set: [0x29, 0x39, 0x49, 0x59],
    n: 4,
    nPerRow: 2,
    transpose: false,
    type: Note,
  },
}

const sidebar = {
  up: [CC, 0x68],
  down: [CC, 0x69],
  left: [CC, 0x6a],
  right: [CC, 0x6b],
  device: [Note, 0x69],
  mute: [Note, 0x6a],
  solo: [Note, 0x6b],
  arm: [Note, 0x6c],
}

const board = Object.fromEntries(
  Object.entries(Sets).flatMap(([name, { set, n, nPerRow, type, transpose }]) =>
    range(set.length * n).map((x) => {
      const r = ~~(x / (n * nPerRow))
      const c = x % (n * nPerRow)
      const index = transpose ? `${c}.${r}` : `${r}.${c}`
      return [`${name}.${index}`, [type, set[~~(x / n)] + (x % n)]]
    }),
  ),
)

const page = Object.assign({}, sidebar, board, { reset: [CC, 0x0] })

const toStatus = (opcode: number, channel: number) => opcode * 16 + channel

const makePage = (i: number) => {
  return Object.entries(page).flatMap(([name, [type, ctrl]]) => {
    if (typeof type === 'number') {
      return [[`${i}.${name}`, [toStatus(type, i), ctrl]]]
    } else {
      const [on, off] = type
      return [
        [`${i}.${name}.on`, [toStatus(on, i), ctrl]],
        [`${i}.${name}.off`, [toStatus(off, i), ctrl]],
      ]
    }
  })
}

export default () => ({
  sysex: true,
  controls: Object.fromEntries(range(16).flatMap((n) => makePage(n))),
})
