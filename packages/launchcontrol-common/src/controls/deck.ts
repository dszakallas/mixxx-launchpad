import { MidiMessage } from '@mixxx-launch/common/midi'
import { absoluteNonLin } from '@mixxx-launch/common'
import { ControlMessage, getValue, root, setValue } from '@mixxx-launch/mixxx/src/Control'
import { Control, ControlBindingTemplate, MidiBindingTemplate, control, midi, MakeControlTemplate } from '../Control'
import { channelColorPalette } from '../util'
import { Color } from '@mixxx-launch/launch-common'

const eq3Channel = ['low', 'mid', 'hi']

export type Eq3Type = {
  type: 'eq3'
  bindings: {
    [ch in (typeof eq3Channel)[number] as `knob.${ch}`]: MidiBindingTemplate<Eq3Type>
  } & {
    [ch in (typeof eq3Channel)[number] as `kill.${ch}`]: ControlBindingTemplate<Eq3Type>
  } & {
    [ch in (typeof eq3Channel)[number] as `val.${ch}`]: ControlBindingTemplate<Eq3Type>
  }
  params: {
    template: number
    column: number
    deck: number
  }
}

export const makeEq3: MakeControlTemplate<Eq3Type> = ({ template, column, deck }) => {
  const bindings: Eq3Type['bindings'] = {}
  const fxParams = root.equalizerRacks[0].effect_units[deck].effects[0].parameters
  eq3Channel.forEach((v, i) => {
    bindings[`knob.${v}`] = {
      type: midi(template, `knob.${2 - i}.${column}`),
      listeners: {
        midi:
          ({ bindings }: Control<Eq3Type>) =>
          ({ value }: MidiMessage) => {
            setValue(bindings[`val.${v}`].control, absoluteNonLin(value, 0, 1, 4))
          },
      },
    }

    bindings[`kill.${v}`] = {
      type: control(fxParams[i].button_value),
      listeners: {
        update:
          ({ context: { device }, bindings }: Control<Eq3Type>) =>
          ({ value }: ControlMessage) => {
            device.sendColor(template, bindings[`knob.${v}`].led, channelColorPalette[deck % 4][value ? 1 : 0])
          },
      },
    }

    bindings[`val.${v}`] = {
      type: control(fxParams[i].value, true),
    }
  })

  return { bindings }
}

export type Eq3KillType = {
  type: 'eq3Kill'
  bindings: {
    [ch in (typeof eq3Channel)[number] | 'qfx' as `pad.${ch}`]: MidiBindingTemplate<Eq3KillType>
  } & {
    [ch in (typeof eq3Channel)[number] | 'qfx' as `kill.${ch}`]: ControlBindingTemplate<Eq3KillType>
  }
  params: {
    template: number
    row: number
    column: number
    deck: number
  }
}

export const makeEq3Kill: MakeControlTemplate<Eq3KillType> = ({ template, row, column, deck }) => {
  const bindings: Eq3KillType['bindings'] = {}
  const fxParams = root.equalizerRacks[0].effect_units[deck].effects[0].parameters

  const eq3KillChannel = [
    ...['low', 'mid', 'hi'].map((v, i) => [v, fxParams[2 - i].button_value] as const),
    ['qfx', root.quickEffectRacks[0].effect_units[deck].enabled] as const,
  ]

  eq3KillChannel.forEach(([v, c], i) => {
    bindings[`pad.${v}`] = {
      type: midi(template, `pad.${row}.${column + i}`, 'on'),
      listeners: {
        midi:
          ({ bindings }: Control<Eq3KillType>) =>
          ({ value }: MidiMessage) => {
            if (value) {
              const ctrl = bindings[`kill.${v}`].control
              setValue(ctrl, 1 - getValue(ctrl))
            }
          },
      },
    }
    bindings[`kill.${v}`] = {
      type: control(c),
      listeners: {
        update:
          ({ context: { device }, bindings }: Control<Eq3KillType>) =>
          ({ value }: ControlMessage) => {
            device.sendColor(template, bindings[`pad.${v}`].led, value ? Color.RedHi : Color.Black)
          },
      },
    }
  })

  return { bindings }
}

export type GainType = {
  type: 'gain'
  bindings: {
    fader: MidiBindingTemplate<GainType>
    ctrl: ControlBindingTemplate<GainType>
  }
  params: {
    template: number
    column: number
    deck: number
  }
}

export const makeGain: MakeControlTemplate<GainType> = ({ template, column, deck }) => ({
  bindings: {
    fader: {
      type: midi(template, `fader.0.${column}`),
      listeners: {
        midi:
          ({ bindings }: Control<GainType>) =>
          ({ value }: MidiMessage) => {
            setValue(bindings.ctrl.control, value / 127)
          },
      },
    },
    ctrl: {
      type: control(root.channels[deck].volume, true),
    },
  },
})
