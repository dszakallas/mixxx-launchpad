/* @flow */
import { engine } from './globals'

import range from 'lodash.range'
import assign from 'lodash.assign'

export type ControlDef = {
  group: string,
  name: string,
  type: string,
  description?: string
}

export class Control {
  def: ControlDef

  constructor (def: ControlDef) {
    this.def = def
  }

  setValue (value: number) {
    engine.setValue(this.def.group, this.def.name, value)
  }

  getValue (): number {
    return engine.getValue(this.def.group, this.def.name)
  }
}

export const playListControlDef: { [key: string]: ControlDef } = {
  'LoadSelectedIntoFirstStopped': { group: '[Playlist]', name: 'LoadSelectedIntoFirstStopped', type: 'binary', description: 'Loads the currently highlighted song into the first stopped deck' },
  'SelectNextPlaylist': { group: '[Playlist]', name: 'SelectNextPlaylist', type: 'binary', description: 'Switches to the next view (Library, Queue, etc.)' },
  'SelectPrevPlaylist': { group: '[Playlist]', name: 'SelectPrevPlaylist', type: 'binary', description: 'Switches to the previous view (Library, Queue, etc.)' },
  'ToggleSelectedSidebarItem': { group: '[Playlist]', name: 'ToggleSelectedSidebarItem', type: 'binary', description: 'Toggles (expands/collapses) the currently selected sidebar item.' },
  'SelectNextTrack': { group: '[Playlist]', name: 'SelectNextTrack', type: 'binary', description: 'Scrolls to the next track in the track table.' },
  'SelectPrevTrack': { group: '[Playlist]', name: 'SelectPrevTrack', type: 'binary', description: 'Scrolls to the previous track in the track table.' },
  'SelectTrackKnob': { group: '[Playlist]', name: 'SelectTrackKnob', type: 'relative value', description: 'Scrolls the given number of tracks in the track table (can be negative for reverse direction).' },
  'AutoDjAddBottom': { group: '[Playlist]', name: 'AutoDjAddBottom', type: 'binary', description: 'Add selected track(s) to Auto DJ Queue (bottom).' },
  'AutoDjAddTop': { group: '[Playlist]', name: 'AutoDjAddTop', type: 'binary', description: 'Add selected track(s) to Auto DJ Queue (top).' }
}

export type PlayListControlKey = $Keys<typeof playListControlDef>

export const playListControl: { [key: PlayListControlKey]: Control } = Object.keys(playListControlDef).reduce((obj, key) => {
  return assign(obj, { [key]: new Control(playListControlDef[key]) })
}, {})

export type SimpleChannelControlKey =
  'back'
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

export type HotcueKey = 'activate' | 'clear' | 'enabled' | 'goto' | 'gotoandplay' | 'gotoandstop' | 'position' | 'set'
export type HotcueDef = { [HotcueKey]: ControlDef }
export type HotcueControl = { [HotcueKey]: Control }

export type BeatloopKey = 'activate' | 'toggle' | 'enabled'
export type BeatloopDef = { [BeatloopKey]: ControlDef }
export type BeatloopControl = { [BeatloopKey]: Control }

export type BeatjumpKey = 'forward' | 'backward'
export type BeatjumpDef = { [BeatjumpKey]: ControlDef }
export type BeatjumpControl = { [BeatjumpKey]: Control }

const channelDef = (type: string, i: number) => ({
  'back': { group: `[${type}${i}]`, name: 'back', type: 'binary' },
  'beat_active': { group: `[${type}${i}]`, name: 'beat_active', type: 'binary' },
  'beatjump': { group: `[${type}${i}]`, name: 'beatjump', type: 'real number' },
  'beatjumps': (x) => ({
    'forward': { group: `[${type}${i}]`, name: `beatjump_${x}_forward`, type: 'binary' },
    'backward': { group: `[${type}${i}]`, name: `beatjump_${x}_backward`, type: 'binary' }
  }),
  'beatloop': { group: `[${type}${i}]`, name: 'beatloop', type: 'positive real number' },
  'beatloops': (x) => ({
    'activate': { group: `[${type}${i}]`, name: `beatloop_${x}_activate`, type: 'binary' },
    'toggle': { group: `[${type}${i}]`, name: `beatloop_${x}_toggle`, type: 'binary' },
    'enabled': { group: `[${type}${i}]`, name: `beatloop_${x}_enabled`, type: 'binary' }
  }),
  'beats_adjust_faster': { group: `[${type}${i}]`, name: 'beats_adjust_faster', type: 'binary' },
  'beats_adjust_slower': { group: `[${type}${i}]`, name: 'beats_adjust_slower', type: 'binary' },
  'beats_translate_curpos': { group: `[${type}${i}]`, name: 'beats_translate_curpos', type: 'binary' },
  'beats_translate_match_alignment': { group: `[${type}${i}]`, name: 'beats_translate_match_alignment', type: 'binary' },
  'beats_translate_earlier': { group: `[${type}${i}]`, name: 'beats_translate_earlier', type: 'binary' },
  'beats_translate_later': { group: `[${type}${i}]`, name: 'beats_translate_later', type: 'binary' },
  'beatsync': { group: `[${type}${i}]`, name: 'beatsync', type: 'binary' },
  'beatsync_phase': { group: `[${type}${i}]`, name: 'beatsync_phase', type: 'binary' },
  'beatsync_tempo': { group: `[${type}${i}]`, name: 'beatsync_tempo', type: 'binary' },
  'bpm': { group: `[${type}${i}]`, name: 'bpm', type: 'real-valued' },
  'bpm_tap': { group: `[${type}${i}]`, name: 'bpm_tap', type: 'binary' },
  'cue_default': { group: `[${type}${i}]`, name: 'cue_default', type: 'binary' },
  'cue_gotoandplay': { group: `[${type}${i}]`, name: 'cue_gotoandplay', type: 'binary' },
  'cue_gotoandstop': { group: `[${type}${i}]`, name: 'cue_gotoandstop', type: 'binary' },
  'cue_indicator': { group: `[${type}${i}]`, name: 'cue_indicator', type: 'binary' },
  'cue_cdj': { group: `[${type}${i}]`, name: 'cue_cdj', type: 'binary' },
  'cue_play': { group: `[${type}${i}]`, name: 'cue_play', type: 'binary' },
  'cue_point': { group: `[${type}${i}]`, name: 'cue_point', type: 'absolute value' },
  'cue_preview': { group: `[${type}${i}]`, name: 'cue_preview', type: 'binary' },
  'cue_set': { group: `[${type}${i}]`, name: 'cue_set', type: 'binary' },
  'cue_simple': { group: `[${type}${i}]`, name: 'cue_simple', type: 'binary' },
  'duration': { group: `[${type}${i}]`, name: 'duration', type: 'absolute value' },
  'eject': { group: `[${type}${i}]`, name: 'eject', type: 'binary' },
  'end': { group: `[${type}${i}]`, name: 'end', type: 'binary' },
  'file_bpm': { group: `[${type}${i}]`, name: 'file_bpm', type: 'positive value' },
  'file_key': { group: `[${type}${i}]`, name: 'file_key', type: '?' },
  'fwd': { group: `[${type}${i}]`, name: 'fwd', type: 'binary' },
  'hotcues': (x) => ({
    'activate': { group: `[${type}${i}]`, name: `hotcue_${x}_activate`, type: 'binary' },
    'clear': { group: `[${type}${i}]`, name: `hotcue_${x}_clear`, type: 'binary' },
    'enabled': { group: `[${type}${i}]`, name: `hotcue_${x}_enabled`, type: 'read-only, binary' },
    'goto': { group: `[${type}${i}]`, name: `hotcue_${x}_goto`, type: 'binary' },
    'gotoandplay': { group: `[${type}${i}]`, name: `hotcue_${x}_gotoandplay`, type: 'binary' },
    'gotoandstop': { group: `[${type}${i}]`, name: `hotcue_${x}_gotoandstop`, type: 'binary' },
    'position': { group: `[${type}${i}]`, name: `hotcue_${x}_position`, type: 'positive integer' },
    'set': { group: `[${type}${i}]`, name: `hotcue_${x}_set`, type: 'binary' }
  }),
  'key': { group: `[${type}${i}]`, name: 'key', type: 'real-valued' },
  'keylock': { group: `[${type}${i}]`, name: 'keylock', type: 'binary' },
  'LoadSelectedTrack': { group: `[${type}${i}]`, name: 'LoadSelectedTrack', type: 'binary' },
  'LoadSelectedTrackAndPlay': { group: `[${type}${i}]`, name: 'LoadSelectedTrackAndPlay', type: 'binary' },
  'loop_double': { group: `[${type}${i}]`, name: 'loop_double', type: 'binary' },
  'loop_enabled': { group: `[${type}${i}]`, name: 'loop_enabled', type: 'read-only, binary' },
  'loop_end_position': { group: `[${type}${i}]`, name: 'loop_end_position', type: 'positive integer' },
  'loop_halve': { group: `[${type}${i}]`, name: 'loop_halve', type: 'binary' },
  'loop_in': { group: `[${type}${i}]`, name: 'loop_in', type: 'binary' },
  'loop_out': { group: `[${type}${i}]`, name: 'loop_out', type: 'binary' },
  'loop_move': { group: `[${type}${i}]`, name: 'loop_move', type: 'real number' },
  'loop_scale': { group: `[${type}${i}]`, name: 'loop_scale', type: '0.0 - infinity' },
  'loop_start_position': { group: `[${type}${i}]`, name: 'loop_start_position', type: 'positive integer' },
  'orientation': { group: `[${type}${i}]`, name: 'orientation', type: '0-2' },
  'passthrough': { group: `[${type}${i}]`, name: 'passthrough', type: 'binary' },
  'PeakIndicator': { group: `[${type}${i}]`, name: 'PeakIndicator', type: 'binary' },
  'pfl': { group: `[${type}${i}]`, name: 'pfl', type: 'binary' },
  'pitch': { group: `[${type}${i}]`, name: 'pitch', type: '-6.0..6.0' },
  'pitch_adjust': { group: `[${type}${i}]`, name: 'pitch_adjust', type: '-3.0..3.0' },
  'play': { group: `[${type}${i}]`, name: 'play', type: 'binary' },
  'play_indicator': { group: `[${type}${i}]`, name: 'play_indicator', type: 'binary' },
  'play_stutter': { group: `[${type}${i}]`, name: 'play_stutter', type: 'binary' },
  'playposition': { group: `[${type}${i}]`, name: 'playposition', type: 'default' },
  'pregain': { group: `[${type}${i}]`, name: 'pregain', type: '0.0..1.0..4.0' },
  'quantize': { group: `[${type}${i}]`, name: 'quantize', type: 'binary' },
  'rate': { group: `[${type}${i}]`, name: 'rate', type: '-1.0..1.0' },
  'rate_dir': { group: `[${type}${i}]`, name: 'rate_dir', type: '-1 or 1' },
  'rate_perm_down': { group: `[${type}${i}]`, name: 'rate_perm_down', type: 'binary' },
  'rate_perm_down_small': { group: `[${type}${i}]`, name: 'rate_perm_down_small', type: 'binary' },
  'rate_perm_up': { group: `[${type}${i}]`, name: 'rate_perm_up', type: 'binary' },
  'rate_perm_up_small': { group: `[${type}${i}]`, name: 'rate_perm_up_small', type: 'binary' },
  'rate_temp_down': { group: `[${type}${i}]`, name: 'rate_temp_down', type: 'binary' },
  'rate_temp_down_small': { group: `[${type}${i}]`, name: 'rate_temp_down_small', type: 'binary' },
  'rate_temp_up': { group: `[${type}${i}]`, name: 'rate_temp_up', type: 'binary' },
  'rate_temp_up_small': { group: `[${type}${i}]`, name: 'rate_temp_up_small', type: 'binary' },
  'rateRange': { group: `[${type}${i}]`, name: 'rateRange', type: '0.0..3.0' },
  'reloop_exit': { group: `[${type}${i}]`, name: 'reloop_exit', type: 'binary' },
  'repeat': { group: `[${type}${i}]`, name: 'repeat', type: 'binary' },
  'reset_key': { group: `[${type}${i}]`, name: 'reset_key', type: 'binary' },
  'reverse': { group: `[${type}${i}]`, name: 'reverse', type: 'binary' },
  'reverseroll': { group: `[${type}${i}]`, name: 'reverseroll', type: 'binary' },
  'slip_enabled': { group: `[${type}${i}]`, name: 'slip_enabled', type: 'binary' },
  'start': { group: `[${type}${i}]`, name: 'start', type: 'binary' },
  'start_play': { group: `[${type}${i}]`, name: 'start_play', type: 'binary' },
  'start_stop': { group: `[${type}${i}]`, name: 'start_stop', type: 'binary' },
  'stop': { group: `[${type}${i}]`, name: 'stop', type: 'binary' },
  'sync_enabled': { group: `[${type}${i}]`, name: 'sync_enabled', type: 'binary' },
  'sync_master': { group: `[${type}${i}]`, name: 'sync_master', type: 'binary' },
  'sync_mode': { group: `[${type}${i}]`, name: 'sync_mode', type: 'binary' },
  'sync_key': { group: `[${type}${i}]`, name: 'sync_key', type: '?' },
  'track_samplerate': { group: `[${type}${i}]`, name: 'track_samplerate', type: 'absolute value' },
  'track_samples': { group: `[${type}${i}]`, name: 'track_samples', type: 'absolute value' },
  'volume': { group: `[${type}${i}]`, name: 'volume', type: 'default' },
  'mute': { group: `[${type}${i}]`, name: 'mute', type: 'binary' },
  'vinylcontrol_enabled': { group: `[${type}${i}]`, name: 'vinylcontrol_enabled', type: 'binary' },
  'vinylcontrol_cueing': { group: `[${type}${i}]`, name: 'vinylcontrol_cueing', type: '0.0-2.0' },
  'vinylcontrol_mode': { group: `[${type}${i}]`, name: 'vinylcontrol_mode', type: '0.0-2.0' },
  'vinylcontrol_status': { group: `[${type}${i}]`, name: 'vinylcontrol_status', type: '0.0-3.0 (read-only)' },
  'visual_bpm': { group: `[${type}${i}]`, name: 'visual_bpm', type: '?' },
  'visual_key': { group: `[${type}${i}]`, name: 'visual_key', type: '?' },
  'visual_key_distance': { group: `[${type}${i}]`, name: 'visual_key_distance', type: '-0.5..0.5' },
  'VuMeter': { group: `[${type}${i}]`, name: 'VuMeter', type: 'default' },
  'VuMeterL': { group: `[${type}${i}]`, name: 'VuMeterL', type: 'default' },
  'VuMeterR': { group: `[${type}${i}]`, name: 'VuMeterR', type: 'default' },
  'waveform_zoom': { group: `[${type}${i}]`, name: 'waveform_zoom', type: '1.0 - 6.0' },
  'waveform_zoom_up': { group: `[${type}${i}]`, name: 'waveform_zoom_up', type: '?' },
  'waveform_zoom_down': { group: `[${type}${i}]`, name: 'waveform_zoom_down', type: '?' },
  'waveform_zoom_set_default': { group: `[${type}${i}]`, name: 'waveform_zoom_set_default', type: '?' },
  'wheel': { group: `[${type}${i}]`, name: 'wheel', type: '-3.0..3.0' }
})

const beatjumps = [0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64]
const beatloops = beatjumps

const createEnumeratedControl = (array, one) => array.reduce((arr, i) => {
  const def: any = one(i)
  const control = Object.keys(def).reduce(
    (obj, key) => assign(obj, { [key]: new Control(def[key]) }),
    {})
  return assign(arr, { [i]: control })
}, {})

export type ChannelControl = {
  [SimpleChannelControlKey]: Control,
  hotcues: HotcueControl[],
  beatjumps: BeatjumpControl[],
  beatloops: BeatloopControl[]
}

export const createChannelControl = (i: number): ChannelControl => {
  const [name, number] = i < 5 ? ['Channel', i] : ['Sampler', i - 4]
  const channelDefInstance = channelDef(name, number)
  const channel = Object.keys(channelDefInstance)
    .filter((key) => (key !== 'beatjumps') && (key !== 'beatloops') && (key !== 'hotcues'))
    .reduce((obj, key) => assign(obj, { [key]: new Control((channelDefInstance[key]: any)) }), {})
  return assign(channel, {
    'beatjumps': createEnumeratedControl(beatjumps, channelDefInstance.beatjumps),
    'beatloops': createEnumeratedControl(beatloops, channelDefInstance.beatloops),
    'hotcues': createEnumeratedControl(range(16).map((x) => x + 1), channelDefInstance.hotcues)
  })
}

export const channelControls: ChannelControl[] = range(8).map((i) => createChannelControl(i + 1))
