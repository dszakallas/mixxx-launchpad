import { range } from '@mixxx-launch/common'
import { MidiComponent as BaseMidiComponent, MidiDevice } from '@mixxx-launch/mixxx'

export enum Color {
  Black = 0,
  RedLow = 1,
  RedHi = 2,
  GreenLow = 3,
  GreenHi = 4,
  AmberLow = 5,
  AmberHi = 6,
  YellowLow = 7,
  YellowHi = 8,
  OrangeLow = 9,
  OrangeHi = 10,
}

export abstract class LaunchControlDevice extends MidiDevice {
  abstract colors: number[]
  abstract numTemplates: number

  // LaunchControl control names follow the pattern "${template}.${controlKey}[.(on|off)]" where the last
  // part is only used for note on/off controls.
  // LED indexes here only use the controlKey part. Note that not every control has a LED.
  abstract leds: { [controlKey: string]: number }

  sysex = true

  template = 0

  constructor() {
    super()
  }

  // Reset the template to the default state, i.e turn off all LEDs.
  abstract resetTemplate(template: number): void

  // Change the current template.
  abstract changeTemplate(template: number): void

  // This method is intended to send SysEx messages to the light up LEDs,
  // which should be preferred over sendShortMsg
  // as it will work regardless of the current template, whereas,
  // short messages not matching the current template are ignored by the device.
  // This is important especially e.g when turning off a LEDs on a template change.
  abstract sendColor(template: number, ledIndex: number, color: number): void

  // Try to parse a SysEx message and return the template number if it was a template change message
  abstract handleTemplateChangeSysex(data: number[]): number | undefined

  handleSysex(data: number[]) {
    const template = this.handleTemplateChangeSysex(data)
    if (template != null) {
      this.template = template
      this.emit('template', template)
    }
  }

  override onMount() {
    super.onMount()
    for (const i of range(this.numTemplates)) {
      this.resetTemplate(i)
    }
    this.addListener('sysex', this.handleSysex.bind(this))
    this.changeTemplate(0)
  }

  override onUnmount() {
    this.removeListener('sysex', this.handleSysex.bind(this))
    for (const i of range(this.numTemplates)) {
      this.resetTemplate(i)
    }
    super.onUnmount()
  }
}

export type OnOff = 'on' | 'off' | undefined

// MidiComponent augments MidiComponent with the LaunchControl specific property
// of having a separate identifier for the LED when targeting with SysEx.
// The LaunchControl programmer manual suggests sending SysEx messages for lighting LEDs
// and they have a different MIDI control than their button/knob counterparts.
// Lighting LEDs with SysEx messages avoids the problem of the LaunchControl ignoring
// MIDI messages that don't match the current template.
export class MidiComponent extends BaseMidiComponent<LaunchControlDevice> {
  template: number
  led: number

  // Use the note parameter to listen to note on/off events instead of control change events. This is required for
  // certain controls like the mute/solo/arm buttons or channel controls. For reference, see the LaunchControl
  // programmer manual or controller.json.
  constructor(device: LaunchControlDevice, template: number, controlKey: string, note?: OnOff) {
    const controlName = note ? `${template}.${controlKey}.${note}` : `${template}.${controlKey}`
    super(device, device.controls[controlName])
    this.template = template
    this.led = device.leds[controlKey]
  }

  onUnmount() {
    // This prevents flickering of LEDs when switching templates.
    this._device.sendColor(this.template, this.led, this._device.colors[0])
    super.onUnmount()
  }
}
