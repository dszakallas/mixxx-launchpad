import { Component, Container } from '@mixxx-launch/common/component'
import { LaunchControlDevice } from './device'

export const channelColorPalette = [
  ['hi_red', 'lo_red'],
  ['hi_yellow', 'lo_yellow'],
  ['hi_green', 'lo_green'],
  ['hi_amber', 'lo_amber'],
] as const

export type MakeComponent = (device: LaunchControlDevice) => Component

export const makeContainer = (children: Component[]) => new Container(children)
