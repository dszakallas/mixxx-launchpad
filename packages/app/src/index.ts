import config from './config'
import App from './App'

import { MidiControlDef, MidiDevice, sendShortMsg } from '@mixxx-launchpad/mixxx'
import { RGBColor } from './color'

export abstract class LaunchpadDevice extends MidiDevice {
  abstract colors: { [key: string]: number }

  abstract supportsRGBColors: boolean

  sendColor(control: MidiControlDef, value: number): void {
    sendShortMsg(control, value)
  }
  clearColor(control: MidiControlDef): void {
    sendShortMsg(control, this.colors.black)
  }

  abstract sendRGBColor(control: MidiControlDef, value: RGBColor): void

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

export type ControllerControlDef = [number, number];

export const convertControlDef = (name: string, [status, midino]: ControllerControlDef): MidiControlDef => ({ name, status, midino })

export type { RGBColor }
