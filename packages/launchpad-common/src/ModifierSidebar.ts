import type { MidiMessage } from '@mixxx-launch/mixxx'
import { Component } from '@mixxx-launch/common/component'

import { LaunchpadDevice, MidiComponent } from './device'

export type ModifierState = {
  ctrl: boolean
  shift: boolean
}

export interface Modifier {
  getState(): ModifierState
}

export default class ModifierSidebar extends Component implements Modifier {
  shift: MidiComponent
  ctrl: MidiComponent
  state: { shift: boolean; ctrl: boolean }
  shiftListener: (_: MidiMessage) => void
  ctrlListener: (_: MidiMessage) => void

  constructor(device: LaunchpadDevice) {
    super()
    this.shift = new MidiComponent(device, device.controls.solo)
    this.ctrl = new MidiComponent(device, device.controls.arm)

    this.state = {
      shift: false,
      ctrl: false,
    }

    const makeListener = (button: MidiComponent) => (message: MidiMessage) => {
      const { value } = message
      if (value) {
        device.sendColor(button.control, device.colors.hi_red)
      } else {
        device.clearColor(button.control)
      }
      if (button.control.name === device.controls.solo.name) {
        this.state.shift = !!value
        this.emit('shift', value)
      } else {
        this.state.ctrl = !!value
        this.emit('ctrl', value)
      }
    }
    this.shiftListener = makeListener(this.shift)
    this.ctrlListener = makeListener(this.ctrl)
  }

  onMount() {
    this.shift.mount()
    this.ctrl.mount()

    this.shift.on('midi', this.shiftListener)
    this.ctrl.on('midi', this.ctrlListener)
  }

  onUnmount() {
    this.shift.removeListener('midi', this.shiftListener)
    this.ctrl.removeListener('midi', this.ctrlListener)

    this.shift.unmount()
    this.ctrl.unmount()
  }

  getState() {
    return this.state
  }
}

export const modes = (ctx: ModifierState, n?: () => void, c?: () => void, s?: () => void, cs?: () => void) => {
  if (ctx.shift && ctx.ctrl) {
    cs && cs() // eslint-disable-line
  } else if (ctx.shift) {
    s && s() // eslint-disable-line
  } else if (ctx.ctrl) {
    c && c() // eslint-disable-line
  } else {
    n && n() // eslint-disable-line
  }
}

export const retainAttackMode = (modifier: Modifier, cb: (ms: ModifierState, mm: MidiMessage) => void) => {
  let state = {
    shift: false,
    ctrl: false,
  }

  return function (data: MidiMessage) {
    if (data.value) {
      state = Object.assign(state, modifier.getState())
    }
    return cb(state, data)
  }
}
