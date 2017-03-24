import { Control } from '../../Mixxx'
import Preset from '../../Controls/Preset'
import Component from '../../Component'

import play from '../controls/play'
import sync from '../controls/sync'
import nudge from '../controls/nudge'
import cue from '../controls/cue'
import tap from '../controls/tap'
import grid from '../controls/grid'
import pfl from '../controls/pfl'
import quantize from '../controls/quantize'
import load from '../controls/load'
import key from '../controls/key'
import reloop from '../controls/reloop'
import loopIo from '../controls/loopIo'
import slip from '../controls/slip'

export default (id, i, offset) => {
  const deck = Control.controls.channels[i]

  const template = {
    play: play([0, 0])(deck),
    sync: sync([1, 0])(deck),
    nudge: nudge([2, 0])(deck),
    cue: cue([0, 1])(deck),
    tap: tap([1, 1])(deck),
    grid: grid([2, 1])(deck),
    pfl: pfl([0, 2])(deck),
    quantize: quantize([1, 2])(deck),
    loopIo: loopIo([2, 2])(deck),
    load: load([0, 3])(deck),
    key: key([1, 3])(deck),
    reloop: reloop([2, 3])(deck),
    slip: slip([3, 3])(deck)
  }
  return new Component({
    onMount () {
      const controls = Preset(id, template, offset)
      const { controlBus, launchpadBus } = this.target
      controls.mount({ controlBus, launchpadBus })
      this.state = { controls }
      return this.state
    },
    onUnmount () {
      const { controls } = this.state
      controls.unmount()
      this.state = null
    }
  })
}
