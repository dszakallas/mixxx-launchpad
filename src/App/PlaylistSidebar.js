import { Button } from '../Launchpad'
import { Control } from '../Mixxx'
import bbind from '../Controls/ButtonBinding'
import Component from '../Component'

const prevPlaylistBtn = Button.buttons.vol
const nextPlaylistBtn = Button.buttons.pan
const toggleItemBtn = Button.buttons.snda
const prevTrackBtn = Button.buttons.sndb
const nextTrackBtn = Button.buttons.stop

const autoscrolled = (binding) => (Timer) => {
  let started
  let minInterval = 32
  let interval
  let timer

  binding.on('midi', (data) => {
    if (data.value) {
      interval = 250
      started = timer.start(interval)
    } else {
      timer.end()
    }
  })

  binding.on('mount', () => {
    timer = Timer(() => {
      binding.emit('scroll')
      if (interval > minInterval) {
        const current = Date.now()
        if (interval === 250 && current - started > 1500) {
          interval = 125
          timer.restart(interval)
        } else if (interval === 125 && current - started > 3000) {
          interval = 63
          timer.restart(interval)
        } else if (interval === 63 && current - started > 6000) {
          interval = minInterval
          timer.restart(interval)
        }
      }
    })
  })

  binding.on('unmount', () => {
    timer.end()
  })

  return binding
}

const onScroll = (control) => () => { Control.setValue(control, 1) }

const onMidi = (control) => ({ value, button }) => {
  if (value) {
    Control.setValue(control, 1)
    Button.send(button, Button.colors.hi_red)
  } else {
    Button.send(button, Button.colors.hi_yellow)
  }
}

const onMount = ({ button }) => {
  Button.send(button, Button.colors.hi_yellow)
}

const onUnmount = ({ button }) => {
  Button.send(button, Button.colors.black)
}

export default (timer) => {
  const btns = [
    bbind.create(prevPlaylistBtn),
    bbind.create(nextPlaylistBtn),
    bbind.create(toggleItemBtn),
    bbind.create(prevTrackBtn),
    bbind.create(nextTrackBtn)
  ]

  const prevPlaylist = autoscrolled(btns[0])(timer)
  const nextPlaylist = autoscrolled(btns[1])(timer)
  const toggleItem = btns[2]
  const prevTrack = autoscrolled(btns[3])(timer)
  const nextTrack = autoscrolled(btns[4])(timer)

  prevPlaylist.on('scroll', onScroll(Control.controls.Playlist.SelectPrevPlaylist))
  prevPlaylist.on('midi', onMidi(Control.controls.Playlist.SelectPrevPlaylist))
  prevPlaylist.on('mount', onMount)
  prevPlaylist.on('unmount', onUnmount)

  nextPlaylist.on('scroll', onScroll(Control.controls.Playlist.SelectNextPlaylist))
  nextPlaylist.on('midi', onMidi(Control.controls.Playlist.SelectNextPlaylist))
  nextPlaylist.on('mount', onMount)
  nextPlaylist.on('unmount', onUnmount)

  prevTrack.on('scroll', onScroll(Control.controls.Playlist.SelectPrevTrack))
  prevTrack.on('midi', onMidi(Control.controls.Playlist.SelectPrevTrack))
  prevTrack.on('mount', onMount)
  prevTrack.on('unmount', onUnmount)

  nextTrack.on('scroll', onScroll(Control.controls.Playlist.SelectNextTrack))
  nextTrack.on('midi', onMidi(Control.controls.Playlist.SelectNextTrack))
  nextTrack.on('mount', onMount)
  nextTrack.on('unmount', onUnmount)

  toggleItem.on('midi', onMidi(Control.controls.Playlist.ToggleSelectedSidebarItem))
  toggleItem.on('mount', onMount)
  toggleItem.on('unmount', onUnmount)

  return new Component({
    onMount () {
      const { launchpadBus } = this.target
      btns.forEach((button) => button.mount(launchpadBus))
    },
    onUnmount () {
      btns.forEach((button) => button.unmount())
    }
  })
}
