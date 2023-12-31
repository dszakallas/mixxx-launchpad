import { Component } from '@mixxx-launch/mixxx'
import { LaunchControlDevice } from './device'

export const channelColorPalette = [
  ['hi_red', 'lo_red'],
  ['hi_yellow', 'lo_yellow'],
  ['hi_green', 'lo_green'],
  ['hi_amber', 'lo_amber'],
] as const

export const makeContainer = (children: Component[]) => new Container(children)

export class Container extends Component {
  children: Component[]

  constructor(children: Component[]) {
    super()
    this.children = children
  }

  onMount() {
    super.onMount()
    for (const child of this.children) {
      child.mount()
    }
  }
  onUnmount() {
    for (const child of this.children) {
      child.unmount()
    }
    super.onUnmount()
  }
}

export type MakeComponent = (device: LaunchControlDevice) => Component
