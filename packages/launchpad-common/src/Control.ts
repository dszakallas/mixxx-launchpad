import { Modifier } from '@mixxx-launch/common/modifier'
import { ControlMessage } from '@mixxx-launch/mixxx'
import { MidiMessage } from '@mixxx-launch/common/midi'
import {
  Control as BaseControl,
  ControlType as BaseControlType,
  MakeControlTemplate,
} from '@mixxx-launch/launch-common'

import { ControlComponent, ControlDef } from '@mixxx-launch/mixxx'
import { Pad, LaunchpadDevice } from './device'
// constraint types with Launchpad specific Context
export type ControlContext = {
  modifier: Modifier
  device: LaunchpadDevice
}

export type ControlType = BaseControlType<ControlContext>
export type Control<C extends ControlType> = BaseControl<ControlContext, C>

export type MakeSamplerControlTemplate<C extends ControlType> = MakeControlTemplate<ControlContext, C>

export type MakeDeckControlTemplate<C extends ControlType> = MakeControlTemplate<ControlContext, C>

export type ControlBindingTemplate<C extends ControlType> = {
  type: (ctx: ControlContext) => ControlComponent
  listeners: {
    update?: (c: Control<C>) => (message: ControlMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export type Cell = readonly [number, number]

const cellToName = (x: number, y: number) => `${7 - y},${x}`

export const cellPad = (cell: Cell) => (ctx: ControlContext) =>
  new Pad(ctx.device, ctx.device.controls[cellToName(...cell)])

export const control = (control: ControlDef) => (_ctx: ControlContext) => new ControlComponent(control)

export type PadBindingTemplate<C extends ControlType> = {
  type: (ctx: ControlContext) => Pad
  listeners: {
    midi?: (c: Control<C>) => (message: MidiMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export type BindingTemplates<C extends ControlType> = {
  [K: string]: PadBindingTemplate<C> | ControlBindingTemplate<C>
}
