import { forEach, range } from "@mixxx-launch/common"
import { MidiDevice } from "@mixxx-launch/mixxx"

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
