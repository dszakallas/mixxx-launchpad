import { MakeDeckControlTemplate } from '../Control'
import makeBeatjump, { Type as Beatjump } from './beatjump'
import makeBeatloop, { Type as Beatloop } from './beatloop'
import makeCue, { Type as Cue } from './cue'
import makeGrid, { Type as Grid } from './grid'
import makeHotcue, { Type as Hotcue } from './hotcue'
import makeKey, { Type as Key } from './key'
import makeKeyshift, { Type as Keyshift } from './keyshift'
import makeLoad, { Type as Load } from './load'
import makeLoopIo, { Type as LoopIo } from './loopIo'
import makeLoopMultiply, { Type as LoopMultiply } from './loopMultiply'
import makeLoopjump, { Type as Loopjump } from './loopjump'
import makeLoopjumpSmall, { Type as LoopjumpSmall } from './loopjumpSmall'
import makeNudge, { Type as Nudge } from './nudge'
import makePfl, { Type as Pfl } from './pfl'
import makePlay, { Type as Play } from './play'
import makeQuantize, { Type as Quantize } from './quantize'
import makeReloop, { Type as Reloop } from './reloop'
import makeSlip, { Type as Slip } from './slip'
import makeSync, { Type as Sync } from './sync'
import makeTap, { Type as Tap } from './tap'
 
export type ControlTypeIndex = 
  Beatjump |
  Beatloop |
  Cue |
  Grid |
  Hotcue |
  Key |
  Keyshift |
  Load |
  LoopIo |
  LoopMultiply |
  Loopjump |
  LoopjumpSmall |
  Nudge |
  Pfl |
  Play |
  Quantize |
  Reloop |
  Slip |
  Sync |
  Tap

export type MakeControlTemplateIndex = {[C in ControlTypeIndex as C["type"]]: MakeDeckControlTemplate<C>}

const index: MakeControlTemplateIndex = {
  beatjump: makeBeatjump,
  beatloop: makeBeatloop,
  cue: makeCue,
  grid: makeGrid,
  hotcue: makeHotcue,
  key: makeKey,
  keyshift: makeKeyshift,
  load: makeLoad,
  loopIo: makeLoopIo,
  loopMultiply: makeLoopMultiply,
  loopjump: makeLoopjump,
  loopjumpSmall: makeLoopjumpSmall,
  nudge: makeNudge,
  pfl: makePfl,
  play: makePlay,
  quantize: makeQuantize,
  reloop: makeReloop,
  slip: makeSlip,
  sync: makeSync,
  tap: makeTap
}

export default index 
