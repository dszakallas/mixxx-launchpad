import { forEach, range } from "@mixxx-launch/common"
import { MidiComponent, MidiDevice } from "@mixxx-launch/mixxx"

export abstract class LaunchControlDevice extends MidiDevice {
  abstract colors: { [key: string]: number }
  abstract numTemplates: number
  abstract leds: { [key: string]: number }
  sysex: boolean = true
  template: number = 0

  constructor() {
    super()
  }

  abstract resetTemplate(template: number): void

  abstract changeTemplate(template: number): void

  // It is advised to use this method instead of sendShortMsg to send color messages
  // as it will work regardless of the current template, whereas with sendShortMsg,
  // messages not matching the current template would be ignored.
  // This is important especially e.g when turning off a LEDs on a template change.
  abstract sendColor(template: number, ledIndex: number, color: number): void

  // tries to parse a sysex message and returns the template number if it was a template change message
  abstract handleTemplateChangeSysex(data: number[]): number | undefined

  handleSysex(data: number[]) {
    const template = this.handleTemplateChangeSysex(data)
    if (template != null) {
      this.template = template
      this.emit('template', template)
    }
  }

  onMount() {
    super.onMount()
    forEach(this.resetTemplate.bind(this), range(this.numTemplates))
    this.addListener('sysex', this.handleSysex.bind(this))
    this.changeTemplate(0)
  }

  onUnmount() {
    this.removeListener('sysex', this.handleSysex.bind(this));
    forEach(this.resetTemplate.bind(this), range(this.numTemplates))
    super.onUnmount()
  }
}


// LCMidiComponent stands for LaunchControlMidiComponent and augments MidiComponent with
// the LaunchControl specific property of having a separate identifier for the LED when targeting with SysEx.
// The LaunchControl programmer manual suggests sending SysEx messages for lighting LEDs
// and they have a different MIDI control than their button/knob counterparts.
// Lighting LEDs with SysEx messages avoids the problem of the LaunchControl ignoring
// MIDI messages that don't match the current template.
export class LCMidiComponent extends MidiComponent<LaunchControlDevice> {
  template: number
  led: number


  // Use the note parameter to listen to note on/off events instead of control change events. This is required for
  // certain controls like the mute/solo/arm buttons or channel controls. For reference, see the LaunchControl
  // programmer manual or controller.json.
  constructor(device: LaunchControlDevice, template: number, controlKey: string, note: "on" | "off" | null = null) {
    const controlName = note ? `${template}.${controlKey}.${note}` : `${template}.${controlKey}`
    super(device, device.controls[controlName])
    this.template = template
    this.led = device.leds[controlKey]
  }

  onUnmount() {
    // This prevents flickering of LEDs when switching templates.
    this._device.sendColor(this.template, this.led, this._device.colors.black)
    super.onUnmount()
  }

}
