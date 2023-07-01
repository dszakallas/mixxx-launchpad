import type { ControlComponent, ControlMessage, MidiMessage } from '@mixxx-launch/mixxx'
import { setValue } from '@mixxx-launch/mixxx'
import { LaunchpadDevice, MidiComponent, parseRGBColor, RGBColor } from '../device'
import { Control, MakeSamplerControlTemplate } from '../Control'
import { modes } from '../ModifierSidebar'

export type Type = {
  type: 'samplerPad'
  bindings: {
    button: MidiComponent
    playing: ControlComponent
    loaded: ControlComponent
    colorChanged: ControlComponent
  }
  state: {
    loaded: boolean
    playing: boolean
    color: RGBColor | null
  }
  params: Record<string, unknown>
}

export const make: MakeSamplerControlTemplate<Type> = (_, gridPosition, sampler, theme) => {
  const onStateChanged = (state: Type['state'], device: LaunchpadDevice, bindings: Type['bindings']) => {
    const color = state.color == null ? theme.fallbackTrackColor : state.color
    if (!state.loaded) {
      device.clearColor(bindings.button.control)
    } else if (!state.playing) {
      if (device.supportsRGBColors) {
        device.sendRGBColor(bindings.button.control, color.map((x) => ~~(x / 4)) as RGBColor)
      } else {
        device.sendColor(bindings.button.control, device.colors.lo_red)
      }
    } else {
      if (device.supportsRGBColors) {
        device.sendRGBColor(bindings.button.control, color as RGBColor)
      } else {
        device.sendColor(bindings.button.control, device.colors.hi_red)
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
        type: 'button',
        target: gridPosition,
        midi:
          ({ context: { modifier }, state }: Control<Type>) =>
          ({value}: MidiMessage) => {
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

      playing: {
        type: 'control',
        target: sampler.play_latched,
        update:
          ({ context: { device }, bindings, state }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            state.playing = !!value
            onStateChanged(state, device, bindings)
          },
      },

      loaded: {
        type: 'control',
        target: sampler.track_loaded,
        update:
          ({ context: { device }, bindings, state }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            state.loaded = !!value
            onStateChanged(state, device, bindings)
          },
      },

      colorChanged: {
        type: 'control',
        target: sampler.track_color,
        update:
          ({ context: { device }, bindings, state }: Control<Type>) =>
          ({ value }: ControlMessage) => {
            state.color = parseRGBColor(value)
            onStateChanged(state, device, bindings)
          },
      },
    },
  }
}

export default make
