import Component from './Component'

export type MidiControlDef = {
  status: number,
  midino: number,
  name: string
}

export type MidiMessage = {
  value: number,
  control: MidiControlDef,
}

export type RawMidiMessageTask = (channel: number, control: number, value: number, status: number) => void

const callbackPrefix = '__midi' as const

type RawMidiMessageTaskRegistry = { [k in `${typeof callbackPrefix}_${string}`]?: RawMidiMessageTask }

const leftPad = (str: string, padString: string, length: number) => {
  let buf = str
  while (buf.length < length) {
    buf = padString + buf
  }
  return buf
}

const hexFormat = (n: number, d: number) => '0x' + leftPad(n.toString(16).toUpperCase(), '0', d)

export abstract class MidiDevice extends Component {

  abstract controls: { [name: string]: MidiControlDef };

  init() {
    this.mount()
  }

  shutdown() {
    this.unmount()
  }

  onMount() {
    super.onMount()
    Object.keys(this.controls).forEach((k) => {
      const control = this.controls[k] as MidiControlDef
      (this as unknown as RawMidiMessageTaskRegistry)[`${callbackPrefix}_${hexFormat(control.status, 2)}_${hexFormat(control.midino, 2)}`] = (_channel, _control, value, _status) => {
        const message: MidiMessage = { value, control }
        this.emit(control.name, message)
      }
    })
  }

  onUnmount() {
    super.onUnmount()
  }
}

export class MidiComponent extends Component {
  control: MidiControlDef

  _cb: (data: MidiMessage) => void
  _device: MidiDevice

  constructor(device: MidiDevice, control: MidiControlDef) {
    super()
    this.control = control
    this._device = device
    this._cb = (data) => {
      if (data.value) {
        this.emit('attack', data)
      } else {
        this.emit('release', data)
      }
      this.emit('midi', data)
    }
  }

  onMount() {
    super.onMount()
    this._device.on(this.control.name, this._cb)
  }

  onUnmount() {
    this._device.removeListener(this.control.name, this._cb)
    super.onUnmount()
  }
}

export const sendShortMsg = (control: MidiControlDef, value: number): void => {
  midi.sendShortMsg(control.status, control.midino, value)
}
