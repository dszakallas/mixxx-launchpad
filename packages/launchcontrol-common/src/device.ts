import { forEach, range } from "@mixxx-launch/common"
import { MidiDevice } from "@mixxx-launch/mixxx"

export abstract class LaunchControlDevice extends MidiDevice {
  abstract colors: { [key: string]: number }
  abstract numTemplates: number
  sysex: boolean = true
  template: number = 0

  constructor() {
    super()
  }

  abstract resetTemplate(template: number): void

  abstract changeTemplate(template: number): void

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
