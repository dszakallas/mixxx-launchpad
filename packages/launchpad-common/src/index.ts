import config from './config'
import App from './App'

import { MidiControlDef } from '@mixxx-launch/mixxx'
import { LaunchpadDevice } from './device'

export const useDevice = (device: LaunchpadDevice) => {
  const app = new App(device, config)
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  return device
}

export type ControllerControlDef = [number, number];

export const convertControlDef = (name: string, [status, midino]: ControllerControlDef): MidiControlDef => ({ name, status, midino })

export type { RGBColor } from './color'

export { LaunchpadDevice, MidiComponent } from './device'
