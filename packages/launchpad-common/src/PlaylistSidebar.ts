import { Component, Container } from '@mixxx-launch/common/component'
import { playListControlDef, Timer, setValue } from '@mixxx-launch/mixxx'
import type { MidiMessage } from '@mixxx-launch/common/midi'
import type { ControlDef } from '@mixxx-launch/mixxx'
import { LaunchpadDevice, Pad } from './device'
import { ControlComponent, ControlMessage, getValue, masterControlDef } from '@mixxx-launch/mixxx/src/Control'
import { Color } from '@mixxx-launch/launch-common'

const longInterval = 240
const mediumInterval = 120
const shortInterval = 60
const minInterval = 30

const autoscrolled = (binding: Component) => {
  let started: number | null = null
  let interval: number | null = null
  let timer: Timer | null = null

  binding.on('midi', (data: MidiMessage) => {
    // unsafe cast: timer should be initialized at this point
    timer = timer as Timer
    if (data.value) {
      interval = longInterval
      started = timer.start(interval)
    } else {
      timer.end()
    }
  })

  binding.on('mount', () => {
    timer = new Timer(() => {
      binding.emit('scroll')
      // unsafe cast: interval should be initialized at this point
      interval = interval as number
      // unsafe cast: timer should be initialized at this point
      timer = timer as Timer
      // unsafe cast: started should be initialized at this point
      started = started as number
      if (interval > minInterval) {
        const current = Date.now()
        if (interval === longInterval && current - started > 1500) {
          interval = mediumInterval
          timer.restart(interval)
        } else if (interval === mediumInterval && current - started > 3000) {
          interval = shortInterval
          timer.restart(interval)
        } else if (interval === shortInterval && current - started > 6000) {
          interval = minInterval
          timer.restart(interval)
        }
      }
    })
  })

  binding.on('unmount', () => (timer as Timer).unmount())

  return binding
}

export default class PlaylistSidebar extends Container {
  constructor(device: LaunchpadDevice) {
    const pads = [
      new Pad(device, device.controls.vol),
      new Pad(device, device.controls.pan),
      new Pad(device, device.controls.snda),
      new Pad(device, device.controls.sndb),
      new Pad(device, device.controls.stop),
      new Pad(device, device.controls.trkon),
    ]

    const controls = [new ControlComponent(masterControlDef.maximize_library)]

    const onScroll = (control: ControlDef) => () => setValue(control, 1)

    const onMidi =
      (control: ControlDef, color: Color = Color.YellowHi) =>
      (message: MidiMessage) => {
        if (message.value) {
          setValue(control, 1)
          device.sendColor(message.control, Color.RedHi)
        } else {
          device.sendColor(message.control, color)
        }
      }

    const onMount =
      (color: Color = Color.YellowHi) =>
      (button: Pad) => {
        button.sendColor(color)
      }

    const onUnmount = (button: Pad) => button.clearColor()

    const scrollConfigs: [Pad, ControlDef][] = [
      [pads[0], playListControlDef.SelectPrevPlaylist],
      [pads[1], playListControlDef.SelectNextPlaylist],
      [pads[3], playListControlDef.SelectPrevTrack],
      [pads[4], playListControlDef.SelectNextTrack],
    ]

    for (const [pad, ctrl] of scrollConfigs) {
      const scrolled = autoscrolled(pad)
      scrolled.on('scroll', onScroll(ctrl))
      scrolled.on('midi', onMidi(ctrl))
      scrolled.on('mount', onMount())
      scrolled.on('unmount', onUnmount)
    }

    const toggleItem = pads[2]
    toggleItem.on('midi', onMidi(playListControlDef.ToggleSelectedSidebarItem, Color.GreenHi))
    toggleItem.on('mount', onMount(Color.GreenHi))
    toggleItem.on('unmount', onUnmount)

    const toggleLibrary = pads[5]
    const toggleLibraryControl = controls[0]

    toggleLibraryControl.on('update', (m: ControlMessage) => {
      toggleLibrary.sendColor(m.value ? Color.RedHi : Color.GreenHi)
    })

    toggleLibrary.on('midi', (m: MidiMessage) => {
      if (m.value) {
        setValue(masterControlDef.maximize_library, 1 - getValue(masterControlDef.maximize_library))
      }
    })

    toggleLibrary.on('unmount', onUnmount)

    super([...pads, ...controls])
  }
}
