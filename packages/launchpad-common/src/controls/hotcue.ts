import { range } from '@mixxx-launch/common'
import { ChannelControlDef, ControlComponent, ControlMessage, MidiMessage } from '@mixxx-launch/mixxx'
import { getValue, setValue } from '@mixxx-launch/mixxx'
import { MidiComponent, parseRGBColor } from '../device'
import { ButtonBindingTemplate, ControlBindingTemplate, MakeDeckControlTemplate, Control } from '../Control'
import { modes } from '../ModifierSidebar'
import { Theme } from '../App'

export type Type = {
  type: 'hotcue'
  params: {
    deck: ChannelControlDef,
    gridPosition: [number, number]
    theme: Theme,
    cues: number
    rows: number
    start?: number
  }
  bindings: {
    [k: `midi.${string}`]: ButtonBindingTemplate<Type>
    [k: `cue.${string}`]: ControlBindingTemplate<Type>
    [k: `color.${string}`]: ControlBindingTemplate<Type>
  }
  state: Record<string, unknown>
}

const make: MakeDeckControlTemplate<Type> = ({ cues, rows, start = 0, gridPosition, deck, theme }) => {
  const onHotcueMidi =
    (i: number) =>
      ({ context: { modifier }, bindings }: Control<Type>) =>
        ({ value }: MidiMessage) => {
          modes(
            modifier.getState(),
            () => {
              setValue(deck.hotcues[1 + i + start].activate, value ? 1 : 0)
            },
            () => {
              if (value) {
                if (getValue(bindings[`cue.${i}`].control)) {
                  setValue(deck.hotcues[1 + i + start].clear, 1)
                } else {
                  setValue(deck.hotcues[1 + i + start].set, 1)
                }
              }
            },
          )
        }
  const onHotcueColorChanged =
    (i: number) =>
      ({ context: { device }, bindings }: Control<Type>) =>
        ({ value }: ControlMessage) => {
          const color = parseRGBColor(value)
          if (device.supportsRGBColors) {
            device.sendRGBColor(bindings[`midi.${i}`].control, color == null ? theme.fallbackHotcueColor : color)
          }
        }
  const onHotcueEnabled =
    (i: number) =>
      ({ context: { device }, bindings }: Control<Type>) =>
        ({ value }: ControlMessage) => {
          if (value) {
            if (device.supportsRGBColors) {
              const color = parseRGBColor(getValue(deck.hotcues[1 + i + start].color))
              device.sendRGBColor(bindings[`midi.${i}`].control, color == null ? theme.fallbackHotcueColor : color)
            } else {
              device.sendColor(bindings[`midi.${i}`].control, device.colors.lo_yellow)
            }
          } else {
            device.clearColor(bindings[`midi.${i}`].control)
          }
        }
  const bindings: Type['bindings'] = {}
  for (const i of range(cues)) {
    const dx = i % rows
    const dy = ~~(i / rows)
    bindings[`midi.${i}`] = {
      type: MidiComponent,
      target: [gridPosition[0] + dx, gridPosition[1] + dy],
      listeners: {
        midi: onHotcueMidi(i),
      }
    }
    bindings[`cue.${i}`] = {
      type: ControlComponent,
      target: deck.hotcues[1 + i + start].enabled,
      listeners: {
        update: onHotcueEnabled(i),
      }
    }
    bindings[`color.${i}`] = {
      type: ControlComponent,
      target: deck.hotcues[1 + i + start].color,
      listeners: {
        update: onHotcueColorChanged(i),
      }
    }
  }

  return {
    bindings,
    state: {},
  }
}

export default make
