import { Control } from '../../Mixxx'
import Preset from '../../Controls/Preset'
import Component from '../../Component'

import play from '../controls/play'
import hotcue from '../controls/hotcue'
import load from '../controls/load'
import beatjump from '../controls/beatjump'
import beatloop from '../controls/beatloop'
import { loopjump } from '../controls/loopjump'
import loopMultiply from '../controls/loopMultiply'
import reloop from '../controls/reloop'

export default (id, i, offset) => {
  const deck = Control.controls.channels[i]

  const template = {
    play: play([0, 0])(deck),
    load: load([1, 0])(deck),
    beatjump: beatjump([[0.5, 4], [1, 16], [2, 32], [4, 64]], true)([2, 0])(deck),
    loopjump: loopjump([[1, 16], [4, 64]])([0, 1])(deck),
    reloop: reloop([0, 3])(deck),
    loopMultiply: loopMultiply([0, 4])(deck),
    hotcue: hotcue(8, 2)([2, 4])(deck),
    beatloop: beatloop([0.5, 1, 2, 4, 8, 16], 2)([0, 5])(deck)
  }
  return new Component({
    onMount () {
      const controls = Preset(id, template, offset)
      const { controlBus, launchpadBus } = this.target
      controls.mount({ controlBus, launchpadBus })
      this.state = { controls }
      console.log('mounted juggler')
      return this.state
    },
    onUnmount () {
      const { controls } = this.state
      controls.unmount()
      console.log('unmounted juggler')
      this.state = null
    }
  })
}
