import { hexFormat } from '@mixxx-launch/common'
import { Component } from '@mixxx-launch/common/component'
import { MidiControlDef, MidiMessage } from '@mixxx-launch/common/midi'

export type RawMidiMessageTask = (channel: number, control: number, value: number, status: number) => void
export type SysexTask = (data: number[]) => void

const midiCallbackPrefix = '__m' as const
// mixxx currently doesn't support custom names for sysex callback handlers, see https://github.com/mixxxdj/mixxx/issues/11536
const sysexCallbackPrefix = 'incomingData' as const

type RawMidiMessageTaskRegistry = {
  [k in `${typeof midiCallbackPrefix}${string}`]?: RawMidiMessageTask
} & { [sysexCallbackPrefix]: SysexTask }

export abstract class MidiDevice extends Component {
  abstract controls: { [name: string]: MidiControlDef }

  // whether to listen for sysex messages
  sysex: boolean = false

  init() {
    this.mount()
  }

  shutdown() {
    this.unmount()
  }

  override onMount() {
    super.onMount()
    const _this = this as unknown as RawMidiMessageTaskRegistry
    Object.values(this.controls).forEach((control) => {
      _this[`${midiCallbackPrefix}${hexFormat(control.status, 2)}${hexFormat(control.midino, 2)}`] = (
        _channel,
        _control,
        value,
        _status,
      ) => {
        const message: MidiMessage = { value, control }
        this.emit(control.name, message)
      }
    })

    if (this.sysex) {
      _this[sysexCallbackPrefix] = (data: number[]) => {
        this.emit('sysex', data)
      }
    }
  }

  override onUnmount() {
    super.onUnmount()
  }
}

export class MidiComponent<D extends MidiDevice> extends Component {
  control: MidiControlDef

  private _cb: (data: MidiMessage) => void
  protected _device: D

  constructor(device: D, control: MidiControlDef) {
    super()
    this.control = control
    this._device = device
    this._cb = (data) => {
      this.emit('midi', data)
    }
  }

  override onMount() {
    super.onMount()
    this._device.on(this.control.name, this._cb)
  }

  override onUnmount() {
    this._device.removeListener(this.control.name, this._cb)
    super.onUnmount()
  }
}

export const sendShortMsg = (control: MidiControlDef, value: number): void => {
  midi.sendShortMsg(control.status, control.midino, value)
}

export const sendSysexMsg = midi.sendSysexMsg
