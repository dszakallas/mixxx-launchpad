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
import keyshift from '../controls/keyshift'
import hotcue from '../controls/hotcue'
import load from '../controls/load'
import key from '../controls/key'
import beatjump from '../controls/beatjump'
import beatloop from '../controls/beatloop'
import { loopjump, loopjumpSmall } from '../controls/loopjump'
import loopMultiply from '../controls/loopMultiply'
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
    keyshift: keyshift([[1, 1], [2, 2], [3, 3], [5, 4], [7, 5], [8, 6], [10, 7], [12, 8]], 2)([2, 2])(deck),
    load: load([0, 3])(deck),
    key: key([1, 3])(deck),
    hotcue: hotcue(8, 2)([0, 4])(deck),
    beatjump: beatjump([[0.25, 1], [0.33, 2], [0.5, 4], [0.75, 8], [1, 16], [2, 32]])([2, 6])(deck),
    beatloop: beatloop([0.5, 1, 2, 4, 8, 16, 32, 64], 2)([4, 2])(deck),
    loopjump: loopjump([[0.5, 8], [1, 16], [2, 32], [4, 64]])([6, 2])(deck),
    loopjumpSmall: loopjumpSmall(0.03125)([6, 1])(deck),
    loopMultiply: loopMultiply([4, 1])(deck),
    reloop: reloop([4, 0])(deck),
    loopIo: loopIo([5, 0])(deck),
    slip: slip([7, 0])(deck)
  }
  return new Component({
    onMount () {
      const controls = Preset(id, template, offset)
      const { controlBus, launchpadBus } = this.target
      controls.mount({ controlBus, launchpadBus })
      this.state = { controls }
      console.log('mounted grande')
      return this.state
    },
    onUnmount () {
      const { controls } = this.state
      controls.unmount()
      console.log('unmounted grande')
      this.state = null
    }
  })
}
