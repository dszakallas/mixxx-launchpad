import { Control as BaseControl, MakeControlTemplate } from '@mixxx-launch/launch-common/src/Control'
import { absoluteNonLin, MidiMessage } from "@mixxx-launch/mixxx"
import { ControlComponent, ControlMessage, root, setValue } from "@mixxx-launch/mixxx/src/Control"
import { LaunchControlDevice, LCMidiComponent } from "./device"
import { Control, ControlBindingTemplate, ControlContext, MidiBindingTemplate, makeBindings } from './Control'

const eq3Channel = ['low', 'mid', 'hi']

export type Type = {
  type: 'eq3'
  bindings: {
    [ch in typeof eq3Channel[number] as `knob.${ch}`]: MidiBindingTemplate<Type>
  } & {
    [ch in typeof eq3Channel[number] as `kill.${ch}`]: ControlBindingTemplate<Type>
  } & {
    [ch in typeof eq3Channel[number] as `val.${ch}`]: ControlBindingTemplate<Type>
  }
  params: {
    template: number
    column: number
    deck: number
  }
  state: Record<string, unknown>
}

const channelColorPalette = [
  ['hi_red', 'lo_red'],
  ['hi_yellow', 'lo_yellow'],
  ['hi_green', 'lo_green'],
  ['hi_amber', 'lo_amber'],
] as const

export const makeEq3Control = (device: LaunchControlDevice, template: number, column: number, deck: number) => {
  const eq3 = makeEq3({template, column, deck})
  return new BaseControl<ControlContext, Type>(makeBindings, eq3.bindings, eq3.state, { device })
}

export const makeEq3: MakeControlTemplate<Type> = ({ template, column, deck }) => {
  const bindings: Type['bindings'] = {}
  const fxParams = root.equalizerRacks[0].effect_units[deck].effects[0].parameters
  eq3Channel.forEach((v, i) => {
    bindings[`knob.${v}`] = {
      type: LCMidiComponent,
      target: [template, `knob.${2-i}.${column}`],
      listeners: {
        midi: ({ bindings }: Control<Type>) => ({ value }: MidiMessage) => {
          setValue(bindings[`val.${v}`].control, absoluteNonLin(value, 0, 1, 4))
        }
      }
    }

    bindings[`kill.${v}`] = {
      type: ControlComponent,
      target: fxParams[i].button_value,
      listeners: {
        update: ({ context: { device }, bindings }: Control<Type>) => ({ value }: ControlMessage) => {
          device.sendColor(template, bindings[`knob.${v}`].led, device.colors[channelColorPalette[deck % 4][value ? 1 : 0]])
        }
      }
    }

    bindings[`val.${v}`] = {
      type: ControlComponent,
      target: fxParams[i].value,
      softTakeOver: true,
      listeners: {}
    }
  })

  return {
    state: {},
    bindings,
  }
}

