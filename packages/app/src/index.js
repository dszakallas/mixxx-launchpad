/* @flow */

/* eslint-disable-next-line no-unused-vars */
import { console, ControlBus, makeTimer, midi } from '@mixxx-launchpad/mixxx'

import { MidiBus } from './MidiBus'
import Screen from './App/Screen'
import Component from './Component'
import { makeControlComponent } from './Controls/ControlComponent'

export type LaunchpadMidiButtonDef = {
  status: number,
  midino: number,
  name: string
}

export interface LaunchpadMidiButton {
  def: LaunchpadMidiButtonDef,
  sendColor (value: number): void,
  sendRgbColor(value: [[number, number, number], number]): void
}

export interface LaunchpadDevice {
  init (): void,
  shutdown (): void,
  buttons: { [key: string]: LaunchpadMidiButton },
  colors: { [key: string]: number }
}

export type MidiMessage = {
  value: number,
  button: LaunchpadMidiButton,
  device: LaunchpadDevice
}

export interface Script {
  getName (): string
}

class Global extends Component {
  screen: Screen
  device: LaunchpadDevice
  name: string

  init: void => void
  shutdown: void => void

  constructor (name: string, device: LaunchpadDevice) {
    super()
    this.name = name
    this.device = device
    const timerBuilder = makeTimer(name, this)
    const controlComponentBuilder = makeControlComponent(ControlBus.create(name, this))
    const midibus = MidiBus.create(this, device)
    this.screen = new Screen(midibus, timerBuilder, controlComponentBuilder, 'main')
    this.init = () => { this.onMount() }
    this.shutdown = () => { this.onUnmount() }
  }

  onMount () {
    this.device.init()
    this.screen.mount()
  }

  onUnmount () {
    this.screen.unmount()
    this.device.shutdown()
  }
}

export function create (name: string, device: LaunchpadDevice) {
  return new Global(name, device)
}
