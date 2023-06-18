import { lazy, Lazy } from "@mixxx-launch/common"
import { Component } from "@mixxx-launch/mixxx"
import { LaunchControlDevice } from "./device"

// For a single template
export type MakePage = (template: number) => Component

export class Pager extends Component {
  pages: Lazy<Component>[]
  repeat: number

  _selected: number | null
  _device: LaunchControlDevice

  constructor(device: LaunchControlDevice, pages: MakePage[], repeat: number | null = null) {
    super()
    this._device = device
    this._selected = 0
    this.repeat = repeat || pages.length 
    this.pages = pages.map((page, i) => lazy(() => page(i)))
  }

  onTemplate(template: number) {
    const newSelected = template % this.repeat < this.pages.length ? template % this.repeat : null
    if (newSelected !== this._selected) {
      if (this.mounted && this._selected != null) {
        this.pages[this._selected].value.unmount()
      }
      this._selected = newSelected
      if (this.mounted && this._selected != null) {
         this.pages[this._selected].value.mount()
      }
    }
  }

  onMount() {
    super.onMount()
    this.onTemplate(this._device.template)
    if (this._selected != null) {
      this.pages[this._selected].value.mount()
    }
    this._device.addListener('template', this.onTemplate.bind(this))
  }

  onUnmount() {
    this._device.removeListener('template', this.onTemplate.bind(this))
    if (this._selected != null) {
      this.pages[this._selected].value.unmount()
    }
    super.onUnmount()
  }
}
