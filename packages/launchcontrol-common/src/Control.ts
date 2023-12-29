import { ControlComponent, ControlDef, ControlMessage, MidiMessage } from "@mixxx-launch/mixxx"
import { LCMidiComponent, LaunchControlDevice, OnOff } from "./device"
import { ControlType as BaseControlType, Control as BaseControl, Bindings } from '@mixxx-launch/launch-common/src/Control'

export type ControlContext = {
  device: LaunchControlDevice
}

export type ControlType = BaseControlType<ControlContext>
export type Control<C extends ControlType> = BaseControl<ControlContext, C>

export type ControlBindingTemplate<C extends ControlType> = {
  type: new (...args: any[]) => ControlComponent
  target: ControlDef
  softTakeover?: boolean
  listeners?: {
    update?: (c: Control<C>) => (message: ControlMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export type ButtonKey = readonly [number, number]

export type MidiTarget = [number, string, OnOff?]

export type MidiBindingTemplate<C extends ControlType> = {
  type: new (...args: any[]) => LCMidiComponent
  target: MidiTarget
  listeners: {
    midi?: (c: Control<C>) => (message: MidiMessage) => void
    mount?: (c: Control<C>) => () => void
    unmount?: (c: Control<C>) => () => void
  }
}

export type BindingTemplates<C extends ControlType> = {
  [K: string]: MidiBindingTemplate<C> | ControlBindingTemplate<C>
}

export const makeBindings = <C extends ControlType>(ctx: ControlContext, t: BindingTemplates<C>): Bindings<C> => {
  const ret: { [_: string]: any } = {}
  for (const k in t) {
    if (t[k].type === ControlComponent) {
      const c = t[k] as ControlBindingTemplate<C>
      const softTakeover = c.softTakeover || false
      ret[k] = new ControlComponent(c.target, softTakeover)
    } else {
      const c = t[k] as MidiBindingTemplate<C>
      ret[k] = new LCMidiComponent(ctx.device, ...c.target)
    }
  }
  return ret as Bindings<C>
}
