import { ControlMessage, MidiMessage } from '@mixxx-launch/mixxx'
import {
  Control as BaseControl,
  ControlType as BaseControlType,
  MakeControlTemplate,
} from '@mixxx-launch/launch-common/src/Control'

import { ControlComponent, ControlDef } from '@mixxx-launch/mixxx/src/Control'
import { LaunchpadDevice, MidiComponent } from './device'
import { Modifier } from './ModifierSidebar'

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

export type ButtonKey = readonly [number, number]

const nameOf = (x: number, y: number) => `${7 - y},${x}`

export const midi = (key: ButtonKey) => (ctx: ControlContext) =>
  new MidiComponent(ctx.device, ctx.device.controls[nameOf(...key)])

export const control = (control: ControlDef) => (_ctx: ControlContext) => new ControlComponent(control)

export type ButtonBindingTemplate<C extends ControlType> = {
  type: (ctx: ControlContext) => MidiComponent
  listeners: {
    midi?: (c: Control<C>) => (message: MidiMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export type BindingTemplates<C extends ControlType> = {
  [K: string]: ButtonBindingTemplate<C> | ControlBindingTemplate<C>
}
