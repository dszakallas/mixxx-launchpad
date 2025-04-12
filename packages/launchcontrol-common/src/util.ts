import { Component, Container } from '@mixxx-launch/common/component'
import { LaunchControlDevice } from './device'
import { Color } from '@mixxx-launch/launch-common'

export const channelColorPalette = [
  [Color.RedHi, Color.RedLow],
  [Color.YellowHi, Color.YellowLow],
  [Color.GreenHi, Color.GreenLow],
  [Color.OrangeHi, Color.OrangeLow],
] as const

export type MakeComponent = (device: LaunchControlDevice) => Component
export const makeContainer = (children: Component[]) => new Container(children)
