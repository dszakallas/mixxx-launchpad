import { Component, Container } from '@mixxx-launch/common/component'
import { playListControlDef, Timer, setValue } from '@mixxx-launch/mixxx'
import type { MidiMessage } from '@mixxx-launch/common/midi'
import type { ControlDef } from '@mixxx-launch/mixxx'
import { LaunchpadDevice, Pad } from './device'
import { ControlComponent, ControlMessage, getValue, masterControlDef } from '@mixxx-launch/mixxx/src/Control'
import type { ColorPalette } from '@mixxx-launch/common'

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
  constructor(device: LaunchpadDevice, colorPalette: ColorPalette) {
    const pads = [
      new Pad(device, device.controls.vol),
      new Pad(device, device.controls.pan),
      new Pad(device, device.controls.snda),
      new Pad(device, device.controls.sndb),
      new Pad(device, device.controls.stop),
      new Pad(device, device.controls.trkon),
    ]

    const controls = [new ControlComponent(masterControlDef.maximize_library)]

    const onScroll = (control: ControlDef) => () => {
      setValue(control, 1)
    }

    const onMidi =
      (control: ControlDef, pad: Pad, valence: number = 2) =>
      (message: MidiMessage) => {
        if (message.value) {
          setValue(control, 1)
          pad.sendPaletteColor(colorPalette.getColor(0, 1))
        } else {
          pad.sendPaletteColor(colorPalette.getColor(valence, 1))
        }
      }

    const onMount =
      (valence: number = 2) =>
      (button: Pad) => {
        button.sendPaletteColor(colorPalette.getColor(valence, 1))
      }

    const onUnmount = (button: Pad) => {
      button.clearColor()
    }

    const prevPlaylist = autoscrolled(pads[0])
    const nextPlaylist = autoscrolled(pads[1])
    const toggleItem = pads[2]
    const prevTrack = autoscrolled(pads[3])
    const nextTrack = autoscrolled(pads[4])
    const toggleLibrary = pads[5]
    const toggleLibraryControl = controls[0]

    prevPlaylist.on('scroll', onScroll(playListControlDef.SelectPrevPlaylist))
    prevPlaylist.on('midi', onMidi(playListControlDef.SelectPrevPlaylist, pads[0]))
    prevPlaylist.on('mount', onMount())
    prevPlaylist.on('unmount', onUnmount)

    nextPlaylist.on('scroll', onScroll(playListControlDef.SelectNextPlaylist))
    nextPlaylist.on('midi', onMidi(playListControlDef.SelectNextPlaylist, pads[1]))
    nextPlaylist.on('mount', onMount())
    nextPlaylist.on('unmount', onUnmount)

    prevTrack.on('scroll', onScroll(playListControlDef.SelectPrevTrack))
    prevTrack.on('midi', onMidi(playListControlDef.SelectPrevTrack, pads[3]))
    prevTrack.on('mount', onMount())
    prevTrack.on('unmount', onUnmount)

    nextTrack.on('scroll', onScroll(playListControlDef.SelectNextTrack))
    nextTrack.on('midi', onMidi(playListControlDef.SelectNextTrack, pads[4]))
    nextTrack.on('mount', onMount())
    nextTrack.on('unmount', onUnmount)

    toggleItem.on('midi', onMidi(playListControlDef.ToggleSelectedSidebarItem, pads[2], 3))
    toggleItem.on('mount', onMount(3))
    toggleItem.on('unmount', onUnmount)

    toggleLibraryControl.on('update', (m: ControlMessage) => {
      if (m.value) {
        toggleLibrary.sendPaletteColor(colorPalette.getColor(0, 1))
      } else {
        toggleLibrary.sendPaletteColor(colorPalette.getColor(3, 1))
      }
    })

    toggleLibrary.on('midi', (m: MidiMessage) => {
      if (m.value) {
        const t = getValue(masterControlDef.maximize_library)
        setValue(masterControlDef.maximize_library, 1 - t)
      }
    })

    toggleLibrary.on('unmount', onUnmount)

    super([...pads, ...controls])
  }
}
