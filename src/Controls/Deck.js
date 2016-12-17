import { Component } from '../Component'
import { ButtonBinding as bbind } from './ButtonBinding'
import { ControlBinding as cbind } from './ControlBinding'

import { Control, console } from '../Mixxx'
import { Button } from '../Launchpad'

const range = require('lodash.range')
const assign = require('lodash.assign')
const mapKeys = require('lodash.mapkeys')

const ControlBindings = (id, i) => {
  const controls = {
    'play': cbind.create(`${id}.play`, Control.controls.decks[i].play),
    'playable': cbind.create(`${id}.playable`, Control.controls.decks[i].play_indicator),
    'startPlay': cbind.create(`${id}.startPlay`, Control.controls.decks[i].start_play),
    'startStop': cbind.create(`${id}.startStop`, Control.controls.decks[i].start_stop)
  }

  const cueEnabled = mapKeys(
    range(8).map((j) => cbind.create(`${id}.hotcue${j}Enabled`, Control.controls.decks[i].hotcue_X[j].enabled)),
    (_, j) => `hotcue${j}Enabled`
  )

  assign(controls, cueEnabled)

  return controls
}

const ButtonBindings = (offset, i) => {
  const nameOf = (x, y) => `${7 - y},${x}`
  const bind = (tgt, bindings) => {
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
  const unbind = (tgt, bindings) => {
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
      const { deck, launchpadBus } = this.target
      const deckBindings = { }
      const buttonBindings = { }
      const buttons = { }

      // Play button

      const play = bbind.create(Button.buttons[nameOf(offset.x, offset.y)])

      const onPlayAttack = ({ context }) => {
        if (context.shift) {
          deck.startPlay.setValue(1)
        } else if (context.ctrl) {
          deck.startStop.setValue(1)
        } else {
          deck.play.toggleValue()
        }
      }

      const onPlay = ({ value }) => {
        if (value) {
          Button.send(play.button, Button.colors.hi_red)
        } else if (deck.playable.getValue()) {
          Button.send(play.button, Button.colors.lo_red)
        } else {
          Button.send(play.button, Button.colors.black)
        }
      }

      const onPlayable = ({ value }) => {
        if (value && !deck.play.getValue()) {
          Button.send(play.button, Button.colors.lo_red)
        } else if (!value && !deck.play.getValue()) {
          Button.send(play.button, Button.colors.black)
        }
      }

      deckBindings.play = onPlay
      deckBindings.playable = onPlayable
      buttonBindings.play = { attack: onPlayAttack }

      buttons.play = play

      // Cues

      const cues = range(8).map((i) => {
        const dx = i % 4
        const dy = ~~(i / 4)
        return bbind.create(Button.buttons[nameOf(offset.x + dx, offset.y + dy + 2)])
      })

      const onCueAttack = (j) => ({ context }) => {
        Control.setValue(Control.controls.decks[i].hotcue_X[j].activate, 1)
      }

      const onCueEnabled = (i) => ({ value }) => {
        if (value) {
          Button.send(cues[i].button, Button.colors.lo_yellow)
        } else {
          Button.send(cues[i].button, Button.colors.black)
        }
      }

      cues.forEach((cue, i) => {
        deckBindings[`hotcue${i}Enabled`] = onCueEnabled(i)
        buttonBindings[`hotcue${i}`] = { attack: onCueAttack(i) }
        buttons[`hotcue${i}`] = cue
      })

      bind(deck, deckBindings)
      bind(buttons, buttonBindings)

      Object.keys(buttons).forEach((btn) => buttons[btn].mount(launchpadBus))

      this.state = { buttonBindings, deckBindings, buttons, deck }
      return this.state
    },
    onUnmount () {
      const { deckBindings, buttonBindings, buttons, deck } = this.state

      Object.keys(buttons).forEach((btn) => buttons[btn].unmount())

      unbind(buttons, buttonBindings)
      unbind(deck, deckBindings)

      this.state = undefined
    }
  })
}

export const Deck = (id, i) => {
  const deck = ControlBindings(id, i)
  const btns = ButtonBindings({ x: 0, y: 0 }, i)
  return new Component({
    onMount () {
      const { controlBus, launchpadBus } = this.target
      Object.keys(deck).forEach((k) => deck[k].mount(controlBus))
      btns.mount({ launchpadBus, deck })
    },
    onUnmount () {
      btns.unmount()
      Object.keys(deck).forEach((k) => deck[k].unmount())
    }
  })
}
