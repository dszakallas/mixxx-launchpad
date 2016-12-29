import { Control } from '../Mixxx'
import { ControlTemplate } from '../Controls/ControlTemplate'
import { Component } from '../Component'

import { play } from './templates/play'
import { sync } from './templates/sync'
import { nudge } from './templates/nudge'
import { cue } from './templates/cue'
import { tap } from './templates/tap'
import { grid } from './templates/grid'
import { pfl } from './templates/pfl'
import { quantize } from './templates/quantize'
import { keyshift } from './templates/keyshift'
import { hotcue } from './templates/hotcue'
import { load } from './templates/load'
import { key } from './templates/key'
import { beatjump } from './templates/beatjump'
import { beatloop } from './templates/beatloop'
import { loopjump, loopjumpSmall } from './templates/loopjump'
import { loopMultiply } from './templates/loopMultiply'
import { reloop } from './templates/reloop'
import { loopIo } from './templates/loopIo'
import { slip } from './templates/slip'

export const Deck = (id, i) => {
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
      const controls = ControlTemplate(id, template)
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
