import { Component, MidiControlDef, MidiDevice } from "@mixxx-launchpad/mixxx"

class App extends Component {
  
}

export abstract class LaunchControlDevice extends MidiDevice {
  abstract colors: { [key: string]: number }

  sendColor(control: MidiControlDef, value: number): void {
  }
  clearColor(control: MidiControlDef): void {
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

export const useDevice = (device: LaunchControlDevice) => {
  const app = new App()
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  return device
}
