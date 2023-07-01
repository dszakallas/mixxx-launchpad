import { range } from "@mixxx-launch/common"
import { absoluteNonLin, Component, MidiMessage } from "@mixxx-launch/mixxx"
import { ControlComponent, ControlMessage, root, setValue } from "@mixxx-launch/mixxx/src/Control"
import { LaunchControlDevice, LCMidiComponent } from "./device"
import { defaultVerticalGroupParams, VerticalGroupParams } from "./util"

export enum Eq3Channel {
  Low,
  Mid,
  High,
}

const eq3 = (deck: number, col: number) => {
  return [
    [`knob.0.${col}`, { type: 'eq3', params: { channel: Eq3Channel.High, deck: deck } }],
    [`knob.1.${col}`, { type: 'eq3', params: { channel: Eq3Channel.Mid, deck: deck } }],
    [`knob.2.${col}`, { type: 'eq3', params: { channel: Eq3Channel.Low, deck: deck } }],
  ] as const
}

export const makeEq3 = ({ template, columnOffset, numDecks }: VerticalGroupParams = defaultVerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  const children: Component[] = []

  const channelColorPalette = [
    [device.colors.hi_red, device.colors.lo_red],
    [device.colors.hi_yellow, device.colors.lo_yellow],
    [device.colors.hi_green, device.colors.lo_green],
    [device.colors.hi_amber, device.colors.lo_amber],
  ]

  for (const i of range(numDecks)) {
    const col = i + columnOffset
    const eqs = eq3(col, col)
    for (const [midi, cd] of eqs) {
      const effectParam = root.equalizerRacks[0].effect_units[cd.params.deck].effects[0].parameters[cd.params.channel]
      const paramControlComponent = new ControlComponent(effectParam.value, true)
      children.push(paramControlComponent)

      const killedControlComponent = new ControlComponent(effectParam.button_value)
      children.push(killedControlComponent)

      const midiComponent = new LCMidiComponent(device, template, midi)
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        setValue(effectParam.value, absoluteNonLin(value, 0, 1, 4))
      })

      killedControlComponent.addListener('update', ({ value }: ControlMessage) => {
        device.sendColor(template, midiComponent.led, channelColorPalette[i % 4][value ? 1 : 0])
      })
      children.push(midiComponent)
    }
  }

  return children
}
