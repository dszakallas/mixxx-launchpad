import { modes } from '@mixxx-launch/common/modifier'
import { ControlMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import {
  PadBindingTemplate,
  ControlBindingTemplate,
  MakeSamplerControlTemplate,
  Control,
  cellPad,
  control,
} from '../Control'
import { SamplerControlDef } from '@mixxx-launch/mixxx/src/Control'
import { Theme } from '../App'
import { MidiMessage } from '@mixxx-launch/common/midi'
import { RGBColor } from '@mixxx-launch/common/color'
import { LaunchDevice } from '@mixxx-launch/launch-common'
import { parseRGBColor } from '@mixxx-launch/mixxx'
import type { ColorPalette } from '@mixxx-launch/common'

export type Type = {
  type: 'samplerPad'
  bindings: {
    button: PadBindingTemplate<Type>
    playing: ControlBindingTemplate<Type>
    loaded: ControlBindingTemplate<Type>
    colorChanged: ControlBindingTemplate<Type>
  }
  state: {
    loaded: boolean
    playing: boolean
    color: RGBColor | null
  }
  params: {
    sampler: SamplerControlDef
    gridPosition: [number, number]
    theme: Theme
  }
}

export const make: MakeSamplerControlTemplate<Type> = ({ gridPosition, sampler, theme }) => {
  const onStateChanged = (
    state: Type['state'],
    device: LaunchDevice,
    bindings: Control<Type>['bindings'],
    colorPalette: ColorPalette,
  ) => {
    const color = state.color == null ? theme.fallbackTrackColor : state.color
    if (!state.loaded) {
      device.clearColor(bindings.button.control)
    } else if (!state.playing) {
      if (bindings.button.supportsRGBColors) {
        bindings.button.sendRGBColor(color.map((x) => ~~(x / 4)) as RGBColor)
      } else {
        bindings.button.sendPaletteColor(colorPalette.getColor(0, 0))
      }
    } else {
      if (bindings.button.supportsRGBColors) {
        bindings.button.sendRGBColor(color)
      } else {
        bindings.button.sendPaletteColor(colorPalette.getColor(0, 1))
      }
    }
  }
  return {
    state: {
      playing: false,
      loaded: false,
      color: null,
    },
    bindings: {
      button: {
        type: cellPad(gridPosition),
        listeners: {
          midi:
            ({ context: { modifier }, state }: Control<Type>) =>
            ({ value }: MidiMessage) => {
              if (value) {
                modes(
                  modifier.getState(),
                  () => {
                    if (!state.loaded) {
                      setValue(sampler.LoadSelectedTrack, 1)
                    } else {
                      setValue(sampler.cue_gotoandplay, 1)
                    }
                  },
                  () => {
                    if (state.playing) {
                      setValue(sampler.stop, 1)
                    } else if (state.loaded) {
                      setValue(sampler.eject, 1)
                    }
                  },
                )
              }
            },
        },
      },

      playing: {
        type: control(sampler.play_latched),
        listeners: {
          update:
            ({ context: { device, colorPalette }, bindings, state }: Control<Type>) =>
            ({ value }: ControlMessage) => {
              state.playing = !!value
              onStateChanged(state, device, bindings, colorPalette)
            },
        },
      },

      loaded: {
        type: control(sampler.track_loaded),
        listeners: {
          update:
            ({ context: { device, colorPalette }, bindings, state }: Control<Type>) =>
            ({ value }: ControlMessage) => {
              state.loaded = !!value
              onStateChanged(state, device, bindings, colorPalette)
            },
        },
      },

      colorChanged: {
        type: control(sampler.track_color),
        listeners: {
          update:
            ({ context: { device, colorPalette }, bindings, state }: Control<Type>) =>
            ({ value }: ControlMessage) => {
              state.color = parseRGBColor(value)
              onStateChanged(state, device, bindings, colorPalette)
            },
        },
      },
    },
  }
}

export default make
