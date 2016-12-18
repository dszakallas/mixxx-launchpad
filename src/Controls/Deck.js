import { Component } from '../Component'
import { ButtonBinding as bbind } from './ButtonBinding'
import { ControlBinding as cbind } from './ControlBinding'

import { Control, console } from '../Mixxx'
import { Button } from '../Launchpad'

import range from 'lodash.range'
import assign from 'lodash.assign'
import mapKeys from 'lodash.mapkeys'

const ControlBindings = (id, i) => {
  const deck = Control.controls.decks[i]
  const controls = {
    'play': cbind.create(`${id}.play`, deck.play),
    'playIndicator': cbind.create(`${id}.playIndicator`, deck.play_indicator),
    'cueIndicator': cbind.create(`${id}.cueIndicator`, deck.cue_indicator)
  }

  const cueEnabled = mapKeys(
    range(8).map((j) => cbind.create(`${id}.hotcues.${j}.enabled`, deck.hotcues[j].enabled)),
    (_, j) => `hotcues.${j}.enabled`
  )

  assign(controls, cueEnabled)

  return controls
}

const ButtonBindings = (offset, i) => {
  const nameOf = (x, y) => `${7 - y},${x}`
  const addListeners = (tgt, bindings) => {
    Object.keys(bindings).forEach((binding) => {
      if (tgt[binding]) {
        if (typeof bindings[binding] === 'function') {
          tgt[binding].on('update', bindings[binding])
          bindings[binding]({ value: tgt[binding].getValue() })
        } else if (typeof bindings[binding] === 'object') {
          Object.keys(bindings[binding]).forEach((k) => {
            tgt[binding].on(k, bindings[binding][k])
          })
        }
      }
    })
  }
  const removeListeners = (tgt, bindings) => {
    Object.keys(bindings).forEach((binding) => {
      if (tgt[binding]) {
        if (typeof bindings[binding] === 'function') {
          tgt[binding].removeListener('update', bindings[binding])
        } else if (typeof bindings[binding] === 'object') {
          Object.keys(bindings[binding]).forEach((k) => {
            tgt[binding].removeListener(k, bindings[binding][k])
          })
        }
      }
    })
  }
  return new Component({
    onMount () {
      const { boundControls, launchpadBus } = this.target
      const controlListeners = { }
      const buttonListeners = { }
      const buttons = { }

      const deck = Control.controls.decks[i]

      // Play button

      const play = bbind.create(Button.buttons[nameOf(offset.x, offset.y)])

      const onPlayAttack = ({ context }) => {
        if (context.shift) {
          Control.setValue(deck.start_play, 1)
        } else if (context.ctrl) {
          Control.setValue(deck.start_stop, 1)
        } else {
          boundControls.play.toggleValue()
        }
      }

      const onPlay = ({ value }) => {
        if (value) {
          Button.send(play.button, Button.colors.hi_red)
        } else if (boundControls.playIndicator.getValue()) {
          Button.send(play.button, Button.colors.hi_red)
        } else {
          Button.send(play.button, Button.colors.black)
        }
      }

      const onPlayIndicator = ({ value }) => {
        if (value && !boundControls.play.getValue()) {
          Button.send(play.button, Button.colors.hi_red)
        } else if (!value && !boundControls.play.getValue()) {
          Button.send(play.button, Button.colors.black)
        }
      }

      controlListeners.play = onPlay
      controlListeners.playIndicator = onPlayIndicator
      buttonListeners.play = { attack: onPlayAttack }

      buttons.play = play

      // Cue

      const cue = bbind.create(Button.buttons[nameOf(offset.x, offset.y + 1)])

      const onCueMidi = ({ value, context }) => {
        console.log(context)
        if (context.shift) {
          if (value) {
            Control.setValue(deck.cue_set, 1)
          }
        } else if (context.ctrl) {
          if (value) {
            Control.setValue(deck.cue_play, 1)
          } else {
            Control.setValue(deck.cue_play, 0)
          }
        } else {
          if (value) {
            Control.setValue(deck.cue_default, 1)
          } else {
            Control.setValue(deck.cue_default, 0)
          }
        }
      }

      const onCueIndicator = ({ value }) => {
        if (value && !boundControls.play.getValue()) {
          Button.send(cue.button, Button.colors.hi_red)
        } else if (!value && !boundControls.play.getValue()) {
          Button.send(cue.button, Button.colors.black)
        }
      }

      controlListeners.cueIndicator = onCueIndicator
      buttonListeners.cue = { midi: onCueMidi }

      buttons.cue = cue

      // Hotcues

      const cues = range(8).map((i) => {
        const dx = i % 4
        const dy = ~~(i / 4)
        return bbind.create(Button.buttons[nameOf(offset.x + dx, offset.y + dy + 2)])
      })

      const onHotcueMidi = (i) => ({ value, context }) => {
        if (value) {
          Control.setValue(deck.hotcues[i].activate, 1)
        } else {
          Control.setValue(deck.hotcues[i].activate, 0)
        }
      }

      const onCueEnabled = (i) => ({ value }) => {
        if (value) {
          Button.send(cues[i].button, Button.colors.lo_yellow)
        } else {
          Button.send(cues[i].button, Button.colors.black)
        }
      }

      cues.forEach((cue, i) => {
        controlListeners[`hotcues.${i}.enabled`] = onCueEnabled(i)
        buttonListeners[`hotcues.${i}`] = { midi: onHotcueMidi(i) }
        buttons[`hotcues.${i}`] = cue
      })

      // end

      addListeners(boundControls, controlListeners)
      addListeners(buttons, buttonListeners)

      Object.keys(buttons).forEach((btn) => buttons[btn].mount(launchpadBus))

      this.state = { buttonListeners, controlListeners, buttons, boundControls }
      return this.state
    },
    onUnmount () {
      const { buttonListeners, controlListeners, buttons, boundControls } = this.state

      Object.keys(buttons).forEach((btn) => buttons[btn].unmount())

      removeListeners(buttons, buttonListeners)
      removeListeners(boundControls, controlListeners)

      this.state = undefined
    }
  })
}

export const Deck = (id, i) => {
  const boundControls = ControlBindings(id, i)
  const boundButtons = ButtonBindings({ x: 0, y: 0 }, i)
  return new Component({
    onMount () {
      const { controlBus, launchpadBus } = this.target
      Object.keys(boundControls).forEach((k) => boundControls[k].mount(controlBus))
      boundButtons.mount({ launchpadBus, boundControls })
    },
    onUnmount () {
      boundButtons.unmount()
      Object.keys(boundControls).forEach((k) => boundControls[k].unmount())
    }
  })
}
