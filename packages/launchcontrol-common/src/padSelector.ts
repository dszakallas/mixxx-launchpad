import { lazy, Lazy } from "@mixxx-launch/common"
import { Component, MidiComponent, MidiMessage, sendShortMsg } from "@mixxx-launch/mixxx"
import { MakeComponent } from "."
import { LaunchControlDevice } from "./device"

export const makePadSelector = (pads: [MakeComponent, MakeComponent, MakeComponent], initialSelection: number = 0) => (device: LaunchControlDevice) => new PadSelector(device, pads, initialSelection)

export default class PadSelector extends Component {
  private _pads: Lazy<Component>[]
  private _device: LaunchControlDevice
  private _selected: number
  private _selectors: Component[]

  constructor(
    device: LaunchControlDevice,
    pads: [MakeComponent, MakeComponent, MakeComponent],
    initialSelection: number = 0
  ) {
    super()
    this._pads = pads.map((page) => lazy(() => page(this._device)))
    this._selected = initialSelection
    this._device = device
    this._selectors = []
  }

  assignButtonComponents(template: number) {
    const btns = ['mute', 'solo', 'arm']
    const buttonComponents = btns.map((btn) =>
      new MidiComponent(this._device, this._device.controls[`${template}.${btn}.on`])
    )

    buttonComponents.forEach((btn, i) => {
      btn.addListener('mount', () => {
        this._device.sendColor(template, this._device.leds[btns[i]], i === this._selected ? this._device.colors.hi_yellow : this._device.colors.black)
      })
      btn.addListener('midi', ({ value }: MidiMessage) => {
        if (value && i !== this._selected) {
          buttonComponents.forEach((btn, j) => {
            this._device.sendColor(template,  this._device.leds[btns[j]], j === i ? this._device.colors.hi_yellow : this._device.colors.black)
          })
          this._pads[this._selected].value.unmount()
          this._selected = i
          this._pads[this._selected].value.mount()
        }
      })
    })
    this._selectors = buttonComponents
  }

  onTemplate(template: number) {
    if (this.mounted) {
      for (const buttonComponent of this._selectors) {
        buttonComponent.unmount()
      }
    }
    this.assignButtonComponents(template)
    if (this.mounted) {
      for (const buttonComponent of this._selectors) {
        buttonComponent.mount()
      }
    }
  }

  onMount() {
    super.onMount()
    this.onTemplate(this._device.template)
    this._pads[this._selected].value.mount()
    for (const buttonComponent of this._selectors) {
      buttonComponent.mount()
    }
    this._device.addListener('template', this.onTemplate.bind(this))
  }

  onUnmount() {
    this._device.removeListener('template', this.onTemplate.bind(this))
    for (const buttonComponent of this._selectors) {
      buttonComponent.unmount()
    }
    this._pads[this._selected].value.unmount()
    super.onUnmount()
  }
}
