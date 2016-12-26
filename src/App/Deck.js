import { Control } from '../Mixxx'
import { ControlTemplate } from '../Controls/ControlTemplate'
import { Component } from '../Component'

import { play } from './play'
import { sync } from './sync'
import { nudge } from './nudge'
import { cue } from './cue'
import { tap } from './tap'
import { grid } from './grid'
import { pfl } from './pfl'
import { quantize } from './quantize'
import { keyshift } from './keyshift'
import { hotcue } from './hotcue'
import { load } from './load'
import { key } from './key'

export const Deck = (id, i) => {
  const deck = Control.controls.decks[i]

  const template = {
    play: play([0, 0])(deck),
    sync: sync([1, 0])(deck),
    nudge: nudge([2, 0])(deck),
    cue: cue([0, 1])(deck),
    tap: tap([1, 1])(deck),
    grid: grid([2, 1])(deck),
    pfl: pfl([0, 2])(deck),
    quantize: quantize([1, 2])(deck),
    keyshift: keyshift([1, 2, 3, 5, 7, 8, 10, 12], 2)([2, 2])(deck),
    hotcue: hotcue(8, 2)([0, 4])(deck),
    load: load([0, 3])(deck),
    key: key([1, 3])(deck)
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
