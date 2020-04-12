/* @flow */
import type { LaunchpadDevice, MidiMessage } from '../../'

import { modes } from '../ModifierSidebar'
import type { Modifier } from '../ModifierSidebar'
import type { ChannelControl } from '@mixxx-launchpad/mixxx'

const SMALL_SAMPLES = 125

export default (gridPosition: [number, number]) => (deck: ChannelControl) => (modifier: Modifier) => (device: LaunchpadDevice) => {
  const loopName = { in: 'loop_in', out: 'loop_out' }
  const loopPosName = { in: 'loop_start_position', out: 'loop_end_position' }
  const onMidi = (dir: 'in' | 'out') => ({ value }: MidiMessage, { bindings }: Object) => {
    modes(modifier.getState(), () => {
      if (value) {
        const ctrl = loopName[dir]
        deck[ctrl].setValue(1)
        deck[ctrl].setValue(0)
      }
    },
    () => {
      if (value) {
        const ctrl = loopPosName[dir]
        deck[ctrl].setValue(deck[ctrl].getValue() - SMALL_SAMPLES)
      }
    },
    () => {
      if (value) {
        const ctrl = loopPosName[dir]
        deck[ctrl].setValue(deck[ctrl].getValue() + SMALL_SAMPLES)
      }
    })
  }
  return {
    bindings: {
      in: {
        type: 'button',
        target: gridPosition,
        midi: onMidi('in')
      },
      out: {
        type: 'button',
        target: [gridPosition[0] + 1, gridPosition[1]],
        midi: onMidi('out')
      }
    }
  }
}
