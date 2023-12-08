import { range } from "@mixxx-launch/common"
import { Component, MidiMessage } from "@mixxx-launch/mixxx"
import { ControlComponent, ControlMessage, root, setValue } from "@mixxx-launch/mixxx/src/Control"
import { LaunchControlDevice, LCMidiComponent } from "./device"
import { VerticalGroupParams } from "./util"


const quickEffect = (deck: number, col: number) => {
  return [
    [`knob.0.${col}`, { type: 'quickEffect', params: { deck: deck } }],
    // [`knob.1.${col}`, { type: 'eq3', params: { channel: Eq3Channel.Mid, deck: deck } }],
    // [`knob.2.${col}`, { type: 'eq3', params: { channel: Eq3Channel.Low, deck: deck } }],
  ] as const
}

export const makeQuickEffect = ({ template, columnOffset, numDecks }: VerticalGroupParams) => (device: LaunchControlDevice): Component[] => {
  columnOffset = columnOffset || 0
  const children: Component[] = []

  const channelColorPalette = [
    [device.colors.hi_red, device.colors.lo_red],
    [device.colors.hi_yellow, device.colors.lo_yellow],
    [device.colors.hi_green, device.colors.lo_green],
    [device.colors.hi_amber, device.colors.lo_amber],
  ]

  for (const i of range(numDecks)) {
    const col = i + columnOffset
    const quickFx = quickEffect(i, col)
    for (const [midi, cd] of quickFx) {
      const effectParam = root.quickEffectRacks[0].effect_units[cd.params.deck]
      const paramControlComponent = new ControlComponent(effectParam.super1, true)
      children.push(paramControlComponent)

      const killedControlComponent = new ControlComponent(effectParam.enabled)
      children.push(killedControlComponent)

      const midiComponent = new LCMidiComponent(device, template, midi)
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        setValue(effectParam.super1, value / 127)
      })

      killedControlComponent.addListener('update', ({ value }: ControlMessage) => {
        device.sendColor(template, midiComponent.led, channelColorPalette[i % 4][value ? 1 : 0])
      })
      children.push(midiComponent)
    }
  }
  return children
}
