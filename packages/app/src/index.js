import './Mixxx/console-polyfill'

import { MidiBus as LaunchpadBus } from './Launchpad'
import { Timer, ControlBus } from './Mixxx'
import Screen from './App/Screen'
import Component from './Component'

export function create (globalName, globalObj = {}) {
  const globalComponent = new Component({
    onMount () {
      const timer = Timer.create(globalName, this.target)
      const controlBus = ControlBus.create(globalName, this.target)
      const launchpadBus = LaunchpadBus.create(this.target)
      this.screen = Screen('main')(timer)

      this.screen.mount({ controlBus, launchpadBus })
    },
    onUnmount () {
      this.screen.unmount()
    }
  })
  globalObj.init = () => { globalComponent.mount(globalObj) }
  globalObj.shutdown = () => { globalComponent.unmount() }
  return globalObj
}
