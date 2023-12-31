import { ControlComponent, ControlDef, ControlMessage, MidiMessage } from '@mixxx-launch/mixxx'
import { MidiComponent, LaunchControlDevice, OnOff } from './device'
import {
  ControlType as BaseControlType,
  Control as BaseControl,
  MakeControlTemplate as BaseMakeControlTemplate,
} from '@mixxx-launch/launch-common/src/Control'

export type ControlContext = {
  device: LaunchControlDevice
}

export type MakeControlTemplate<C extends ControlType> = BaseMakeControlTemplate<ControlContext, C>

export type ControlType = BaseControlType<ControlContext>
export type Control<C extends ControlType> = BaseControl<ControlContext, C>

export type ControlBindingTemplate<C extends ControlType> = {
  type: (ctx: ControlContext) => ControlComponent
  listeners?: {
    update?: (c: Control<C>) => (message: ControlMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export type MidiTarget = [number, string, OnOff?]

export type MidiBindingTemplate<C extends ControlType> = {
  type: (ctx: ControlContext) => MidiComponent
  listeners: {
    midi?: (c: Control<C>) => (message: MidiMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export const midi = (template: number, controlKey: string, note?: OnOff) => (ctx: ControlContext) =>
  new MidiComponent(ctx.device, template, controlKey, note)

export const control = (control: ControlDef, softTakeover?: boolean) => (_ctx: ControlContext) =>
  new ControlComponent(control, softTakeover)

export type BindingTemplates<C extends ControlType> = {
  [K: string]: MidiBindingTemplate<C> | ControlBindingTemplate<C>
}
