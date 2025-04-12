import { lazy, Lazy } from '@mixxx-launch/common/lazy'
import { Component } from '@mixxx-launch/common/component'
import { LaunchControlDevice } from './device'
import { PageConf, makePageIndex } from './page'

export const makePager =
  (pages: readonly PageConf[], repeat: number | null = null) =>
  (device: LaunchControlDevice) =>
    new Pager(device, pages, repeat)

export class Pager extends Component {
  pages: Lazy<Component>[]
  repeat: number

  private _selected: number | null
  private _device: LaunchControlDevice

  constructor(device: LaunchControlDevice, pages: readonly PageConf[], repeat: number | null = null) {
    super()
    this._device = device
    this._selected = 0
    this.repeat = repeat || pages.length
    // eslint-disable-next-line
    this.pages = pages.map((page, i) => lazy(() => makePageIndex[page.type](page as unknown as any, i, this._device)))
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

  override onMount() {
    super.onMount()
    this.onTemplate(this._device.template)
    if (this._selected != null) {
      this.pages[this._selected].value.mount()
    }
    this._device.addListener('template', this.onTemplate.bind(this))
  }

  override onUnmount() {
    this._device.removeListener('template', this.onTemplate.bind(this))
    if (this._selected != null) {
      this.pages[this._selected].value.unmount()
    }
    super.onUnmount()
  }
}
