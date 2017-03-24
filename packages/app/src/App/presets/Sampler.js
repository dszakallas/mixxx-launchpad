import { Control } from '../../Mixxx'
import Preset from '../../Controls/Preset'
import Component from '../../Component'

import hotcue from '../controls/hotcue'

export default (id, i, offset) => {
  const deck = Control.controls.channels[i]

  const template = {
    hotcue: hotcue(16, 4)([0, 0])(deck)
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
