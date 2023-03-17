import config from './config'
import App from './App'

import { MidiControlDef, MidiDevice, sendShortMsg } from '@mixxx-launchpad/mixxx'

export abstract class LaunchpadDevice extends MidiDevice {
  abstract colors: { [key: string]: number }

  sendColor(control: MidiControlDef, value: number): void {
    sendShortMsg(control, value)
  }
  clearColor(control: MidiControlDef): void {
    sendShortMsg(control, this.colors.black)
  }

  constructor() {
    super()
  }

  onMount() {
    super.onMount()
  }

  onUnmount() {
    super.onUnmount()
  }
}

export const useDevice = (device: LaunchpadDevice) => {
  const app = new App(device, config)
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  return device
}



