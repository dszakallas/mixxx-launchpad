import { Action } from './util'

import Component from './Component'

import type { Connection } from './mixxx'
import { array, map, range } from '@mixxx-launch/common'

export type ControlDef = {
  group: string
  name: string
  type: string
}

export const playListControlDef: { [key: string]: ControlDef } = {
  LoadSelectedIntoFirstStopped: { group: '[Playlist]', name: 'LoadSelectedIntoFirstStopped', type: 'binary' },
  SelectNextPlaylist: { group: '[Playlist]', name: 'SelectNextPlaylist', type: 'binary' },
  SelectPrevPlaylist: { group: '[Playlist]', name: 'SelectPrevPlaylist', type: 'binary' },
  ToggleSelectedSidebarItem: { group: '[Playlist]', name: 'ToggleSelectedSidebarItem', type: 'binary' },
  SelectNextTrack: { group: '[Playlist]', name: 'SelectNextTrack', type: 'binary' },
  SelectPrevTrack: { group: '[Playlist]', name: 'SelectPrevTrack', type: 'binary' },
  SelectTrackKnob: { group: '[Playlist]', name: 'SelectTrackKnob', type: 'relative value' },
  AutoDjAddBottom: { group: '[Playlist]', name: 'AutoDjAddBottom', type: 'binary' },
  AutoDjAddTop: { group: '[Playlist]', name: 'AutoDjAddTop', type: 'binary' },
}

export type PlayListControlKey = keyof typeof playListControlDef

export const masterControlDef: { [key: string]: ControlDef } = {
  maximize_library: { group: '[Master]', name: 'maximize_library', type: 'binary' },
  num_samplers: { group: '[Master]', name: 'num_samplers', type: 'number' },
}

export type MasterControlKey = keyof typeof masterControlDef

// just enough for samplers
export type SamplerControlKey =
  | 'LoadSelectedTrack'
  | 'cue_gotoandplay'
  | 'stop'
  | 'eject'
  | 'track_color'
  | 'track_loaded'
  | 'play'
  | 'play_latched'

export type SamplerControlDef = {
  [_ in SamplerControlKey]: ControlDef
}

const createSamplerControlDef = (type: string, i: number): SamplerControlDef => ({
  LoadSelectedTrack: { group: `[${type}${i}]`, name: 'LoadSelectedTrack', type: 'binary' },
  cue_gotoandplay: { group: `[${type}${i}]`, name: 'cue_gotoandplay', type: 'binary' },
  eject: { group: `[${type}${i}]`, name: 'eject', type: 'binary' },
  play: { group: `[${type}${i}]`, name: 'play', type: 'binary' },
  play_latched: { group: `[${type}${i}]`, name: 'play_latched', type: 'binary' },
  stop: { group: `[${type}${i}]`, name: 'stop', type: 'binary' },
  track_color: { group: `[${type}${i}]`, name: 'track_color', type: 'number' },
  track_loaded: { group: `[${type}${i}]`, name: 'track_loaded', type: 'binary' },
})

export const numDecks = 4 as const
export const numSamplers = 64 as const

const getChannelNameForOrdinal = (i: number): [string, number] => (i < numDecks ? ['Channel', i + 1] : ['Sampler', i - 4 + 1])

export const samplerControlDefs: SamplerControlDef[] = array(map((i: number) => {
  const [name, number] = getChannelNameForOrdinal(i)
  return createSamplerControlDef(name, number)
}, range(numDecks + numSamplers)))

// the full control palette for decks, minus repeated controls (e.g hotcues)
export type SimpleChannelControlKey =
  | 'back'
  | 'beat_active'
  | 'beatjump'
  | 'beatloop'
  | 'beats_adjust_faster'
  | 'beats_adjust_slower'
  | 'beats_translate_curpos'
  | 'beats_translate_match_alignment'
  | 'beats_translate_earlier'
  | 'beats_translate_later'
  | 'beatsync'
  | 'beatsync_phase'
  | 'beatsync_tempo'
  | 'bpm'
  | 'bpm_tap'
  | 'cue_default'
  | 'cue_gotoandplay'
  | 'cue_gotoandstop'
  | 'cue_indicator'
  | 'cue_cdj'
  | 'cue_play'
  | 'cue_point'
  | 'cue_preview'
  | 'cue_set'
  | 'cue_simple'
  | 'duration'
  | 'eject'
  | 'end'
  | 'file_bpm'
  | 'file_key'
  | 'fwd'
  | 'key'
  | 'keylock'
  | 'LoadSelectedTrack'
  | 'LoadSelectedTrackAndPlay'
  | 'loop_double'
  | 'loop_enabled'
  | 'loop_end_position'
  | 'loop_halve'
  | 'loop_in'
  | 'loop_out'
  | 'loop_move'
  | 'loop_scale'
  | 'loop_start_position'
  | 'orientation'
  | 'passthrough'
  | 'PeakIndicator'
  | 'pfl'
  | 'pitch'
  | 'pitch_adjust'
  | 'play'
  | 'play_indicator'
  | 'play_latched'
  | 'play_stutter'
  | 'playposition'
  | 'pregain'
  | 'quantize'
  | 'rate'
  | 'rate_dir'
  | 'rate_perm_down'
  | 'rate_perm_down_small'
  | 'rate_perm_up'
  | 'rate_perm_up_small'
  | 'rate_temp_down'
  | 'rate_temp_down_small'
  | 'rate_temp_up'
  | 'rate_temp_up_small'
  | 'rateRange'
  | 'reloop_andstop'
  | 'reloop_exit'
  | 'repeat'
  | 'reset_key'
  | 'reverse'
  | 'reverseroll'
  | 'slip_enabled'
  | 'start'
  | 'start_play'
  | 'start_stop'
  | 'stop'
  | 'sync_enabled'
  | 'sync_master'
  | 'sync_mode'
  | 'sync_key'
  | 'track_color'
  | 'track_loaded'
  | 'track_samplerate'
  | 'track_samples'
  | 'volume'
  | 'mute'
  | 'vinylcontrol_enabled'
  | 'vinylcontrol_cueing'
  | 'vinylcontrol_mode'
  | 'vinylcontrol_status'
  | 'visual_bpm'
  | 'visual_key'
  | 'visual_key_distance'
  | 'VuMeter'
  | 'VuMeterL'
  | 'VuMeterR'
  | 'waveform_zoom'
  | 'waveform_zoom_up'
  | 'waveform_zoom_down'
  | 'waveform_zoom_set_default'
  | 'wheel'

export type SimpleChannelControlDef = {
  [_ in SimpleChannelControlKey]: ControlDef
}

const createSimpleChannelControlDef = (type: string, i: number): SimpleChannelControlDef => ({
  back: { group: `[${type}${i}]`, name: 'back', type: 'binary' },
  beat_active: { group: `[${type}${i}]`, name: 'beat_active', type: 'binary' },
  beatjump: { group: `[${type}${i}]`, name: 'beatjump', type: 'real number' },
  beatloop: { group: `[${type}${i}]`, name: 'beatloop', type: 'positive real number' },
  beats_adjust_faster: { group: `[${type}${i}]`, name: 'beats_adjust_faster', type: 'binary' },
  beats_adjust_slower: { group: `[${type}${i}]`, name: 'beats_adjust_slower', type: 'binary' },
  beats_translate_curpos: { group: `[${type}${i}]`, name: 'beats_translate_curpos', type: 'binary' },
  beats_translate_match_alignment: { group: `[${type}${i}]`, name: 'beats_translate_match_alignment', type: 'binary' },
  beats_translate_earlier: { group: `[${type}${i}]`, name: 'beats_translate_earlier', type: 'binary' },
  beats_translate_later: { group: `[${type}${i}]`, name: 'beats_translate_later', type: 'binary' },
  beatsync: { group: `[${type}${i}]`, name: 'beatsync', type: 'binary' },
  beatsync_phase: { group: `[${type}${i}]`, name: 'beatsync_phase', type: 'binary' },
  beatsync_tempo: { group: `[${type}${i}]`, name: 'beatsync_tempo', type: 'binary' },
  bpm: { group: `[${type}${i}]`, name: 'bpm', type: 'real-valued' },
  bpm_tap: { group: `[${type}${i}]`, name: 'bpm_tap', type: 'binary' },
  cue_default: { group: `[${type}${i}]`, name: 'cue_default', type: 'binary' },
  cue_gotoandplay: { group: `[${type}${i}]`, name: 'cue_gotoandplay', type: 'binary' },
  cue_gotoandstop: { group: `[${type}${i}]`, name: 'cue_gotoandstop', type: 'binary' },
  cue_indicator: { group: `[${type}${i}]`, name: 'cue_indicator', type: 'binary' },
  cue_cdj: { group: `[${type}${i}]`, name: 'cue_cdj', type: 'binary' },
  cue_play: { group: `[${type}${i}]`, name: 'cue_play', type: 'binary' },
  cue_point: { group: `[${type}${i}]`, name: 'cue_point', type: 'absolute value' },
  cue_preview: { group: `[${type}${i}]`, name: 'cue_preview', type: 'binary' },
  cue_set: { group: `[${type}${i}]`, name: 'cue_set', type: 'binary' },
  cue_simple: { group: `[${type}${i}]`, name: 'cue_simple', type: 'binary' },
  duration: { group: `[${type}${i}]`, name: 'duration', type: 'absolute value' },
  eject: { group: `[${type}${i}]`, name: 'eject', type: 'binary' },
  end: { group: `[${type}${i}]`, name: 'end', type: 'binary' },
  file_bpm: { group: `[${type}${i}]`, name: 'file_bpm', type: 'positive value' },
  file_key: { group: `[${type}${i}]`, name: 'file_key', type: '?' },
  fwd: { group: `[${type}${i}]`, name: 'fwd', type: 'binary' },
  key: { group: `[${type}${i}]`, name: 'key', type: 'real-valued' },
  keylock: { group: `[${type}${i}]`, name: 'keylock', type: 'binary' },
  LoadSelectedTrack: { group: `[${type}${i}]`, name: 'LoadSelectedTrack', type: 'binary' },
  LoadSelectedTrackAndPlay: { group: `[${type}${i}]`, name: 'LoadSelectedTrackAndPlay', type: 'binary' },
  loop_double: { group: `[${type}${i}]`, name: 'loop_double', type: 'binary' },
  loop_enabled: { group: `[${type}${i}]`, name: 'loop_enabled', type: 'read-only, binary' },
  loop_end_position: { group: `[${type}${i}]`, name: 'loop_end_position', type: 'positive integer' },
  loop_halve: { group: `[${type}${i}]`, name: 'loop_halve', type: 'binary' },
  loop_in: { group: `[${type}${i}]`, name: 'loop_in', type: 'binary' },
  loop_out: { group: `[${type}${i}]`, name: 'loop_out', type: 'binary' },
  loop_move: { group: `[${type}${i}]`, name: 'loop_move', type: 'real number' },
  loop_scale: { group: `[${type}${i}]`, name: 'loop_scale', type: '0.0 - infinity' },
  loop_start_position: { group: `[${type}${i}]`, name: 'loop_start_position', type: 'positive integer' },
  orientation: { group: `[${type}${i}]`, name: 'orientation', type: '0-2' },
  passthrough: { group: `[${type}${i}]`, name: 'passthrough', type: 'binary' },
  PeakIndicator: { group: `[${type}${i}]`, name: 'PeakIndicator', type: 'binary' },
  pfl: { group: `[${type}${i}]`, name: 'pfl', type: 'binary' },
  pitch: { group: `[${type}${i}]`, name: 'pitch', type: '-6.0..6.0' },
  pitch_adjust: { group: `[${type}${i}]`, name: 'pitch_adjust', type: '-3.0..3.0' },
  play: { group: `[${type}${i}]`, name: 'play', type: 'binary' },
  play_latched: { group: `[${type}${i}]`, name: 'play_latched', type: 'binary' },
  play_indicator: { group: `[${type}${i}]`, name: 'play_indicator', type: 'binary' },
  play_stutter: { group: `[${type}${i}]`, name: 'play_stutter', type: 'binary' },
  playposition: { group: `[${type}${i}]`, name: 'playposition', type: 'default' },
  pregain: { group: `[${type}${i}]`, name: 'pregain', type: '0.0..1.0..4.0' },
  quantize: { group: `[${type}${i}]`, name: 'quantize', type: 'binary' },
  rate: { group: `[${type}${i}]`, name: 'rate', type: '-1.0..1.0' },
  rate_dir: { group: `[${type}${i}]`, name: 'rate_dir', type: '-1 or 1' },
  rate_perm_down: { group: `[${type}${i}]`, name: 'rate_perm_down', type: 'binary' },
  rate_perm_down_small: { group: `[${type}${i}]`, name: 'rate_perm_down_small', type: 'binary' },
  rate_perm_up: { group: `[${type}${i}]`, name: 'rate_perm_up', type: 'binary' },
  rate_perm_up_small: { group: `[${type}${i}]`, name: 'rate_perm_up_small', type: 'binary' },
  rate_temp_down: { group: `[${type}${i}]`, name: 'rate_temp_down', type: 'binary' },
  rate_temp_down_small: { group: `[${type}${i}]`, name: 'rate_temp_down_small', type: 'binary' },
  rate_temp_up: { group: `[${type}${i}]`, name: 'rate_temp_up', type: 'binary' },
  rate_temp_up_small: { group: `[${type}${i}]`, name: 'rate_temp_up_small', type: 'binary' },
  rateRange: { group: `[${type}${i}]`, name: 'rateRange', type: '0.0..3.0' },
  reloop_andstop: { group: `[${type}${i}]`, name: 'reloop_andstop', type: 'binary' },
  reloop_exit: { group: `[${type}${i}]`, name: 'reloop_exit', type: 'binary' },
  repeat: { group: `[${type}${i}]`, name: 'repeat', type: 'binary' },
  reset_key: { group: `[${type}${i}]`, name: 'reset_key', type: 'binary' },
  reverse: { group: `[${type}${i}]`, name: 'reverse', type: 'binary' },
  reverseroll: { group: `[${type}${i}]`, name: 'reverseroll', type: 'binary' },
  slip_enabled: { group: `[${type}${i}]`, name: 'slip_enabled', type: 'binary' },
  start: { group: `[${type}${i}]`, name: 'start', type: 'binary' },
  start_play: { group: `[${type}${i}]`, name: 'start_play', type: 'binary' },
  start_stop: { group: `[${type}${i}]`, name: 'start_stop', type: 'binary' },
  stop: { group: `[${type}${i}]`, name: 'stop', type: 'binary' },
  sync_enabled: { group: `[${type}${i}]`, name: 'sync_enabled', type: 'binary' },
  sync_master: { group: `[${type}${i}]`, name: 'sync_master', type: 'binary' },
  sync_mode: { group: `[${type}${i}]`, name: 'sync_mode', type: 'binary' },
  sync_key: { group: `[${type}${i}]`, name: 'sync_key', type: '?' },
  track_color: { group: `[${type}${i}]`, name: 'track_color', type: 'number' },
  track_loaded: { group: `[${type}${i}]`, name: 'track_loaded', type: 'binary' },
  track_samplerate: { group: `[${type}${i}]`, name: 'track_samplerate', type: 'absolute value' },
  track_samples: { group: `[${type}${i}]`, name: 'track_samples', type: 'absolute value' },
  volume: { group: `[${type}${i}]`, name: 'volume', type: 'default' },
  mute: { group: `[${type}${i}]`, name: 'mute', type: 'binary' },
  vinylcontrol_enabled: { group: `[${type}${i}]`, name: 'vinylcontrol_enabled', type: 'binary' },
  vinylcontrol_cueing: { group: `[${type}${i}]`, name: 'vinylcontrol_cueing', type: '0.0-2.0' },
  vinylcontrol_mode: { group: `[${type}${i}]`, name: 'vinylcontrol_mode', type: '0.0-2.0' },
  vinylcontrol_status: { group: `[${type}${i}]`, name: 'vinylcontrol_status', type: '0.0-3.0 (read-only)' },
  visual_bpm: { group: `[${type}${i}]`, name: 'visual_bpm', type: '?' },
  visual_key: { group: `[${type}${i}]`, name: 'visual_key', type: '?' },
  visual_key_distance: { group: `[${type}${i}]`, name: 'visual_key_distance', type: '-0.5..0.5' },
  VuMeter: { group: `[${type}${i}]`, name: 'VuMeter', type: 'default' },
  VuMeterL: { group: `[${type}${i}]`, name: 'VuMeterL', type: 'default' },
  VuMeterR: { group: `[${type}${i}]`, name: 'VuMeterR', type: 'default' },
  waveform_zoom: { group: `[${type}${i}]`, name: 'waveform_zoom', type: '1.0 - 6.0' },
  waveform_zoom_up: { group: `[${type}${i}]`, name: 'waveform_zoom_up', type: '?' },
  waveform_zoom_down: { group: `[${type}${i}]`, name: 'waveform_zoom_down', type: '?' },
  waveform_zoom_set_default: { group: `[${type}${i}]`, name: 'waveform_zoom_set_default', type: '?' },
  wheel: { group: `[${type}${i}]`, name: 'wheel', type: '-3.0..3.0' },
})

export type HotcueKey =
  | 'activate'
  | 'clear'
  | 'color'
  | 'enabled'
  | 'goto'
  | 'gotoandplay'
  | 'gotoandstop'
  | 'position'
  | 'set'
export type HotcueDef = { [_ in HotcueKey]: ControlDef }

export type BeatloopKey = 'activate' | 'toggle' | 'enabled'
export type BeatloopDef = { [_ in BeatloopKey]: ControlDef }

export type BeatjumpKey = 'forward' | 'backward'
export type BeatjumpDef = { [_ in BeatjumpKey]: ControlDef }

// repeated controls
export type ArrayChannelControlDef = HotcueDef | BeatloopDef | BeatjumpDef

const createArrayChannelControlDefCreators = (type: string, i: number) => ({
  hotcues: (x: number): HotcueDef => ({
    activate: { group: `[${type}${i}]`, name: `hotcue_${x}_activate`, type: 'binary' },
    clear: { group: `[${type}${i}]`, name: `hotcue_${x}_clear`, type: 'binary' },
    color: { group: `[${type}${i}]`, name: `hotcue_${x}_color`, type: 'binary' },
    enabled: { group: `[${type}${i}]`, name: `hotcue_${x}_enabled`, type: 'read-only, binary' },
    goto: { group: `[${type}${i}]`, name: `hotcue_${x}_goto`, type: 'binary' },
    gotoandplay: { group: `[${type}${i}]`, name: `hotcue_${x}_gotoandplay`, type: 'binary' },
    gotoandstop: { group: `[${type}${i}]`, name: `hotcue_${x}_gotoandstop`, type: 'binary' },
    position: { group: `[${type}${i}]`, name: `hotcue_${x}_position`, type: 'positive integer' },
    set: { group: `[${type}${i}]`, name: `hotcue_${x}_set`, type: 'binary' },
  }),
  beatjumps: (x: number): BeatjumpDef => ({
    forward: { group: `[${type}${i}]`, name: `beatjump_${x}_forward`, type: 'binary' },
    backward: { group: `[${type}${i}]`, name: `beatjump_${x}_backward`, type: 'binary' },
  }),
  beatloops: (x: number): BeatloopDef => ({
    activate: { group: `[${type}${i}]`, name: `beatloop_${x}_activate`, type: 'binary' },
    toggle: { group: `[${type}${i}]`, name: `beatloop_${x}_toggle`, type: 'binary' },
    enabled: { group: `[${type}${i}]`, name: `beatloop_${x}_enabled`, type: 'binary' },
  }),
})

const beatjumps = [0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64] as const
const beatloops = [0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64] as const

const createArrayChannelControlDef = <Def extends ArrayChannelControlDef>(
  array: ReadonlyArray<number>,
  createOneDef: (n: number) => Def,
) =>
  array.reduce((arr, i) => {
    return Object.assign(arr, { [i]: createOneDef(i) })
  }, {})

export type ChannelControlDef = SimpleChannelControlDef & {
  hotcues: { [x: number]: HotcueDef }
  beatjumps: { [x: number]: BeatjumpDef }
  beatloops: { [x: number]: BeatloopDef }
}

export const createChannelControlDef = (i: number): ChannelControlDef => {
  const [name, number] = getChannelNameForOrdinal(i)
  const simpleChannelControlDef = createSimpleChannelControlDef(name, number)
  const arrayChannelControlDefCreators = createArrayChannelControlDefCreators(name, number)
  return Object.assign(simpleChannelControlDef, {
    beatjumps: createArrayChannelControlDef(beatjumps, arrayChannelControlDefCreators.beatjumps),
    beatloops: createArrayChannelControlDef(beatloops, arrayChannelControlDefCreators.beatloops),
    hotcues: createArrayChannelControlDef(
      array(map((x: number) => x + 1, range(16))),
      arrayChannelControlDefCreators.hotcues,
    ),
  })
}

export const channelControlDefs: ChannelControlDef[] = array(map((i: number) => createChannelControlDef(i), range(8)))

export type RackName = `EffectRack${number}` | `EqualizerRack${number}` | `QuickEffectRack${number}`

export type EffectRackKey = 'num_effectunits' | 'clear'
export type EffectRackDef = { [_ in EffectRackKey]: ControlDef }

export const createEffectRackDef = (rack: RackName): EffectRackDef => ({
  num_effectunits: { group: `[${rack}]`, name: `num_effectunits`, type: 'number' },
  clear: { group: `[${rack}]`, name: `clear`, type: 'binary' },
})

export const numEqualizerRacks = 1 as const

export type EffectUnitName = string

export type EffectUnitKey = 'chain_selector' | 'clear' | 'enabled' | 'focused_effect' | 'mix' | 'super1' | 'num_effects' | 'num_effectslots'
export type EffectUnitDef = {[_ in EffectUnitKey]: ControlDef}

export const createEffectUnitDef = (rack: RackName, unit: EffectUnitName): EffectUnitDef => ({
  chain_selector: { group: `[${rack}_${unit}]`, name: `chain_selector`, type: 'number' },
  clear: { group: `[${rack}_${unit}]`, name: `clear`, type: 'binary' },
  enabled: { group: `[${rack}_${unit}]`, name: `enabled`, type: 'binary' },
  focused_effect: { group: `[${rack}_${unit}]`, name: `focused_effect`, type: 'number' },
  mix: { group: `[${rack}_${unit}]`, name: `mix`, type: 'number' },
  super1: { group: `[${rack}_${unit}]`, name: `super1`, type: 'number' },
  num_effects: { group: `[${rack}_${unit}]`, name: `num_effects`, type: 'number' },
  num_effectslots: { group: `[${rack}_${unit}]`, name: `num_effectslots`, type: 'number' },
})


export type EffectKey = 'clear' | 'effect_selector' | 'enabled' | 'loaded' | 'next_effect' | 'num_parameters' | 'num_parameterslots' |
  'num_button_parameters' | 'num_button_parameterslots' | 'meta' | 'prev_effect'
export type EffectDef = { [_ in EffectKey]: ControlDef }

export const createEffectDef = (rack: RackName, unit: EffectUnitName, effect: string): EffectDef => ({
  clear: { group: `[${rack}_${unit}_${effect}]`, name: `clear`, type: 'binary' },
  effect_selector: { group: `[${rack}_${unit}_${effect}]`, name: `effect_selector`, type: 'number' },
  enabled: { group: `[${rack}_${unit}_${effect}]`, name: `enabled`, type: 'binary' },
  loaded: { group: `[${rack}_${unit}_${effect}]`, name: `loaded`, type: 'binary' },
  next_effect: { group: `[${rack}_${unit}_${effect}]`, name: `next_effect`, type: 'binary' },
  num_parameters: { group: `[${rack}_${unit}_${effect}]`, name: `num_parameters`, type: 'number' },
  num_parameterslots: { group: `[${rack}_${unit}_${effect}]`, name: `num_parameterslots`, type: 'number' },
  num_button_parameters: { group: `[${rack}_${unit}_${effect}]`, name: `num_button_parameters`, type: 'number' },
  num_button_parameterslots: { group: `[${rack}_${unit}_${effect}]`, name: `num_button_parameterslots`, type: 'number' },
  meta: { group: `[${rack}_${unit}_${effect}]`, name: `meta`, type: 'number' },
  prev_effect: { group: `[${rack}_${unit}_${effect}]`, name: `prev_effect`, type: 'binary' },
})

export const numEqualizerEffects = 1 as const

export type EffectParameterKey = 'value' | 'link_inverse' | 'link_type' | 'loaded' | 'type' | 'button_value' | 'button_loaded' | 'button_type'
export type EffectParameterDef = { [_ in EffectParameterKey]: ControlDef }

export const createEffectParameterDef = (rack: RackName, unit: EffectUnitName, effect: string, parameter: number): EffectParameterDef => ({
  value: { group: `[${rack}_${unit}_${effect}]`, name: `parameter${parameter}`, type: 'number' },
  link_inverse: { group: `[${rack}_${unit}_${effect}]`, name: `parameter${parameter}_link_inverse`, type: 'binary' },
  link_type: { group: `[${rack}_${unit}_${effect}]`, name: `parameter${parameter}_link_type`, type: 'number' },
  loaded: { group: `[${rack}_${unit}_${effect}]`, name: `parameter${parameter}_loaded`, type: 'binary' },
  type: { group: `[${rack}_${unit}_${effect}]`, name: `parameter${parameter}_type`, type: 'number' },
  button_value: { group: `[${rack}_${unit}_${effect}]`, name: `button_parameter${parameter}`, type: 'number' },
  button_loaded: { group: `[${rack}_${unit}_${effect}]`, name: `button_parameter${parameter}_loaded`, type: 'binary' },
  button_type: { group: `[${rack}_${unit}_${effect}]`, name: `button_parameter${parameter}_type`, type: 'number' },
})

export const getValue = (control: ControlDef): number => {
  return engine.getValue(control.group, control.name)
}

export const setValue = (control: ControlDef, value: number): void => {
  return engine.setValue(control.group, control.name, value)
}

export const softTakeover = (control: ControlDef, enable: boolean): void => {
  return engine.softTakeover(control.group, control.name, enable)
}
export type ControlHandle = Connection

export type ControlMessage = {
  value: number
  control: ControlDef
}

const connect = (control: ControlDef, cb: Action<ControlMessage>): ControlHandle => {
  const { group, name } = control
  return engine.makeConnection(group, name, function (value: number) {
    cb({ value, control })
  })
}

const disconnect = (handle: ControlHandle): void => {
  if (handle.isConnected) {
    handle.disconnect()
  }
}

export class ControlComponent extends Component {
  control: ControlDef
  _handle?: any
  _softTakeover?: boolean

  constructor(control: ControlDef, softTakeover?: boolean) {
    super()
    this.control = control
    this._handle = null
    this._softTakeover = softTakeover
  }

  onMount() {
    if (!this._handle) {
      this._handle = connect(this.control, (data: ControlMessage) => {
        this.emit('update', data)
      })
      if (this._softTakeover != null) {
        console.log('softTakeover', this.control, this._softTakeover)
        softTakeover(this.control, this._softTakeover)
      }
      const initialMessage = {
        control: this.control,
        value: getValue(this.control),
      }
      this.emit('update', initialMessage)
    }
  }

  onUnmount() {
    if (this._handle) {
      disconnect(this._handle)
      this._handle = null
    }
  }
}
