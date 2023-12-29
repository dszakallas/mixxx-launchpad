import { array, map, range } from '@mixxx-launch/common'
import { MakeControlTemplate } from '@mixxx-launch/launch-common/src/Control'
import { MidiMessage } from "@mixxx-launch/mixxx"
import { ControlComponent, ControlMessage, createEffectUnitChannelDef, getValue, root, setValue } from "@mixxx-launch/mixxx/src/Control"
import { Control, ControlBindingTemplate, MidiBindingTemplate } from '../Control'
import { LCMidiComponent } from "../device"
import { channelColorPalette } from '../util'

const fxRack = root.effectRacks[0]
const qfxRack = root.quickEffectRacks[0]

export type FxEnablerType = {
  type: 'fxEnabler'
  bindings: {
    [_: `pad.${number}`]: MidiBindingTemplate<FxEnablerType>
    [_: `ctrl.${number}`]: ControlBindingTemplate<FxEnablerType>
  }
  params: {
    template: number
    row: number
    column: number
    deck: number
  }
}

export const makeFxEnabler: MakeControlTemplate<FxEnablerType> = ({ template, row, column, deck }) => {
  const unit = fxRack.effect_units[deck]
  const controls = [...map(i => unit.effects[i].enabled, range(3)), unit.enabled]

  const bindings: FxEnablerType['bindings'] = {}

  controls.forEach((control, i) => {
    bindings[`pad.${i}`] = {
      type: LCMidiComponent,
      target: [template, `pad.${row}.${column + i}`, 'on'],
      listeners: {
        midi: ({ bindings }: Control<FxEnablerType>) => ({ value }: MidiMessage) => {
          if (value) {
            const ctrl = bindings[`ctrl.${i}`].control
            setValue(ctrl, 1 - getValue(ctrl))
          }
        }
      }
    }
    bindings[`ctrl.${i}`] = {
      type: ControlComponent,
      target: control,
      listeners: {
        update: ({ context: { device }, bindings }: Control<FxEnablerType>) => ({ value }: ControlMessage) => {
          device.sendColor(template, bindings[`pad.${i}`].led, value ? device.colors.hi_green : device.colors.black)
        }
      }
    }
  })
  return { bindings }
}

export type FxSelectorType = {
  type: 'fxSelector'
  bindings: {
    [_: `pad.${number}`]: MidiBindingTemplate<FxSelectorType>
    [_: `ctrl.${number}`]: ControlBindingTemplate<FxSelectorType>
  }
  params: {
    template: number
    row: number
    column: number
    deck: number
  }
}

export const makeFxSelector: MakeControlTemplate<FxSelectorType> = ({ template, row, column, deck }) => {
  const bindings: FxSelectorType['bindings'] = {}

  array(range(4)).forEach(i => {
    const control = createEffectUnitChannelDef(
      "EffectRack1", `EffectUnit${i + 1}`, `Channel${deck + 1}`,
    ).enable

    bindings[`pad.${i}`] = {
      type: LCMidiComponent,
      target: [template, `pad.${row}.${column + i}`, 'on'],
      listeners: {
        midi: ({ bindings }: Control<FxSelectorType>) => ({ value }: MidiMessage) => {
          if (value) {
            setValue(bindings[`ctrl.${i}`].control, 1 - getValue(bindings[`ctrl.${i}`].control))
          }
        }
      }
    }
    bindings[`ctrl.${i}`] = {
      type: ControlComponent,
      target: control,
      listeners: {
        update: ({ context: { device }, bindings }: Control<FxSelectorType>) => ({ value }: ControlMessage) => {
          device.sendColor(template, bindings[`pad.${i}`].led, value ? device.colors.hi_yellow : device.colors.black)
        }
      }
    }
  })

  return { bindings }
}

export type FxMetaType = {
  type: 'fxMeta'
  bindings: {
    [_: `knob.${number}`]: MidiBindingTemplate<FxMetaType>
    [_: `ctrl.${number}`]: ControlBindingTemplate<FxMetaType>
  }
  params: {
    template: number
    column: number
    unit: number
  }
}

export const makeFxMeta: MakeControlTemplate<FxMetaType> = ({ template, column, unit }) => {
  const bindings: FxMetaType['bindings'] = {}

  array(range(3)).forEach(i => {
    const control = fxRack.effect_units[unit].effects[i].meta
    bindings[`knob.${i}`] = {
      type: LCMidiComponent,
      target: [template, `knob.${i}.${column}`],
      listeners: {
        midi: ({ bindings }: Control<FxMetaType>) => ({ value }: MidiMessage) => {
          setValue(bindings[`ctrl.${i}`].control, value / 127)
        }
      }
    }
    bindings[`ctrl.${i}`] = {
      type: ControlComponent,
      target: control,
      softTakeover: true,
      listeners: {
        update: ({ context: { device }, bindings }: Control<FxMetaType>) => ({ value }: ControlMessage) => {
          device.sendColor(template, bindings[`knob.${i}`].led, value ? device.colors[channelColorPalette[unit % 4][0]] : device.colors.black)
        }
      }
    }
  })
  return { bindings }
}

export type FxSuperType = {
  type: 'fxSuper'
  bindings: {
    knob: MidiBindingTemplate<FxSuperType>
    ctrl: ControlBindingTemplate<FxSuperType>
  }
  params: {
    template: number
    row: number
    column: number
    unit: number
  }
}

export const makeFxSuper: MakeControlTemplate<FxSuperType> = ({ template, column, row, unit }) => ({
  bindings: {
    knob: {
      type: LCMidiComponent,
      target: [template, `knob.${row}.${column}`],
      listeners: {
        midi: ({ bindings }: Control<FxSuperType>) => ({ value }: MidiMessage) => {
          setValue(bindings.ctrl.control, value / 127)
        }
      }
    },
    ctrl: {
      type: ControlComponent,
      target: fxRack.effect_units[unit].super1,
      listeners: {
        update: ({ context: { device }, bindings }: Control<FxSuperType>) => ({ value }: ControlMessage) => {
          device.sendColor(template, bindings.knob.led, value ? device.colors[channelColorPalette[unit % 4][0]] : device.colors.black)
        }
      },
      softTakeover: true,
    }
  }
})

export type FxMixType = {
  type: 'fxMix'
  bindings: {
    fader: MidiBindingTemplate<FxMixType>
    ctrl: ControlBindingTemplate<FxMixType>
  }
  params: {
    template: number
    column: number
    unit: number
  }
}

export const makeFxMix: MakeControlTemplate<FxMixType> = ({ template, column, unit }) => ({
  bindings: {
    fader: {
      type: LCMidiComponent,
      target: [template, `fader.0.${column}`],
      listeners: {
        midi: ({ bindings }: Control<FxMixType>) => ({ value }: MidiMessage) => {
          setValue(bindings.ctrl.control, value / 127)
        }
      }
    },
    ctrl: {
      type: ControlComponent,
      target: fxRack.effect_units[unit].mix,
      softTakeover: true
    }
  }
})

export type QuickFxType = {
  type: 'quickEffect'
  bindings: {
    knob: MidiBindingTemplate<QuickFxType>
    value: ControlBindingTemplate<QuickFxType>
    kill: ControlBindingTemplate<QuickFxType>
  }
  params: {
    template: number
    row: number
    column: number
    unit: number
  }
}

export const makeQuickFx: MakeControlTemplate<QuickFxType> = ({ template, row, column, unit }) => ({
  bindings: {
    knob: {
      type: LCMidiComponent,
      target: [template, `knob.${row}.${column}`],
      listeners: {
        midi: ({ bindings }: Control<QuickFxType>) => ({ value }: MidiMessage) => {
          setValue(bindings.value.control, value / 127)
        }
      }
    },
    value: {
      type: ControlComponent,
      target: qfxRack.effect_units[unit].super1,
      softTakeover: true
    },
    kill: {
      type: ControlComponent,
      target: qfxRack.effect_units[unit].enabled,
      listeners: {
        update: ({ context: { device }, bindings }: Control<QuickFxType>) => ({ value }: ControlMessage) => {
          device.sendColor(template, bindings.knob.led, device.colors[channelColorPalette[unit % 4][value ? 1 : 0]])
        }
      }
    }
  }
})
