import { Component } from '../Component'
import { ButtonBinding as bbind } from './ButtonBinding'
import { ControlBinding as cbind } from './ControlBinding'

import { Control, console } from '../Mixxx'
import { Button } from '../Launchpad'

import range from 'lodash.range'
import assign from 'lodash.assign'
import mapKeys from 'lodash.mapkeys'

const retainAttackMode = (cb) => {
  let shift = false
  let ctrl = false

  return (data) => {
    if (data.value) {
      shift = data.context.shift
      ctrl = data.context.ctrl
    } else {
      data.context.shift = shift
      data.context.ctrl = ctrl
    }
    cb(data)
  }
}

const modes = (data, n, c, s, cs) => {
  if (data.context.shift && data.context.ctrl) {
    cs && cs(data)
  } else if (data.context.shift) {
    s && s(data)
  } else if (data.context.ctrl) {
    c && c(data)
  } else {
    n(data)
  }
}

const ControlBindings = (id, i) => {
  const deck = Control.controls.decks[i]
  const controls = {
    'play': cbind.create(`${id}.play`, deck.play),
    'playIndicator': cbind.create(`${id}.playIndicator`, deck.play_indicator),
    'cueIndicator': cbind.create(`${id}.cueIndicator`, deck.cue_indicator),
    'syncMode': cbind.create(`${id}.syncMode`, deck.sync_mode),
    'rate': cbind.create(`${id}.rate`, deck.rate)
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

      const onPlayAttack = (data) => {
        modes(data,
          () => boundControls.play.toggleValue(),
          () => Control.setValue(deck.start_play, 1),
          () => Control.setValue(deck.start_stop, 1)
        )
      }

      const onPlayIndicator = ({ value }) => {
        if (value) {
          Button.send(play.button, Button.colors.hi_red)
        } else if (!value) {
          Button.send(play.button, Button.colors.black)
        }
      }

      controlListeners.playIndicator = onPlayIndicator
      buttonListeners.play = { attack: onPlayAttack }

      buttons.play = play

      // Sync / Master

      const sync = bbind.create(Button.buttons[nameOf(offset.x + 1, offset.y)])

      const onSyncAttack = (data) => {
        modes(data,
          () => {
            if (boundControls.syncMode.getValue()) {
              Control.setValue(deck.sync_enabled, 0)
            } else {
              Control.setValue(deck.sync_enabled, 1)
            }
          },
          () => {
            if (boundControls.syncMode.getValue() === 2) {
              Control.setValue(deck.sync_master, 0)
            } else {
              Control.setValue(deck.sync_master, 1)
            }
          }
        )
      }

      const onSyncMode = ({ value }) => {
        console.log(value)
        if (value === 0) {
          Button.send(sync.button, Button.colors.black)
        } else if (value === 1) {
          Button.send(sync.button, Button.colors.hi_orange)
        } else if (value === 2) {
          Button.send(sync.button, Button.colors.hi_red)
        }
      }

      controlListeners.syncMode = onSyncMode
      buttonListeners.sync = { attack: onSyncAttack }

      buttons.sync = sync

      // Nudge / Pitch

      const nudgeButtons = {
        'down': bbind.create(Button.buttons[nameOf(offset.x + 2, offset.y)]),
        'up': bbind.create(Button.buttons[nameOf(offset.x + 3, offset.y)])
      }

      const nudgePressed = {
        'down': false,
        'up': false
      }

      const getDirection = (rate) => {
        if (rate < -0.0001) {
          return 'down'
        } else if (rate > 0.0001) {
          return 'up'
        }
      }

      const onNudgeMidi = (dir) => retainAttackMode((data) => {
        if (data.value) {
          nudgePressed[dir] = true
          modes(data,
            () => {
              Button.send(nudgeButtons[dir].button, Button.colors.hi_yellow)
              Control.setValue(deck[`rate_temp_${dir}`], 1)
            },
            () => {
              Button.send(nudgeButtons[dir].button, Button.colors.hi_red)
              Control.setValue(deck[`rate_perm_${dir}`], 1)
            },
            () => {
              Button.send(nudgeButtons[dir].button, Button.colors.lo_yellow)
              Control.setValue(deck[`rate_temp_${dir}_small`], 1)
            },
            () => {
              Button.send(nudgeButtons[dir].button, Button.colors.lo_red)
              Control.setValue(deck[`rate_perm_${dir}_small`], 1)
            }
          )
        } else {
          nudgePressed[dir] = false
          if (getDirection(boundControls.rate.getValue()) === dir) {
            Button.send(nudgeButtons[dir].button, Button.colors.lo_amber)
          } else {
            Button.send(nudgeButtons[dir].button, Button.colors.black)
          }
          modes(data,
            () => Control.setValue(deck[`rate_temp_${dir}`], 0),
            undefined,
            () => Control.setValue(deck[`rate_temp_${dir}_small`], 0)
          )
        }
      })

      const onRate = ({ value }) => {
        if (!nudgePressed.down && value < 0.0001) {
          Button.send(nudgeButtons.down.button, Button.colors.lo_amber)
        } else if (!nudgePressed.down) {
          Button.send(nudgeButtons.down.button, Button.colors.black)
        }

        if (!nudgePressed.up && value > 0.0001) {
          Button.send(nudgeButtons.up.button, Button.colors.lo_amber)
        } else if (!nudgePressed.up) {
          Button.send(nudgeButtons.up.button, Button.colors.black)
        }
      }

      buttons.nudgeDown = nudgeButtons['down']
      buttonListeners.nudgeDown = { midi: onNudgeMidi('down') }

      buttons.nudgeUp = nudgeButtons['up']
      buttonListeners.nudgeUp = { midi: onNudgeMidi('up') }

      controlListeners.rate = onRate

      // Cue

      const cue = bbind.create(Button.buttons[nameOf(offset.x, offset.y + 1)])

      const onCueMidi = retainAttackMode((data) => {
        modes(data,
          ({ value }) => {
            if (value) {
              Control.setValue(deck.cue_default, 1)
            } else {
              Control.setValue(deck.cue_default, 0)
            }
          },
          ({ value }) => value && Control.setValue(deck.cue_set, 1),
        )
      })

      const onCueIndicator = ({ value }) => {
        if (value) {
          Button.send(cue.button, Button.colors.hi_red)
        } else if (!value) {
          Button.send(cue.button, Button.colors.black)
        }
      }

      controlListeners.cueIndicator = onCueIndicator
      buttonListeners.cue = { midi: onCueMidi }

      buttons.cue = cue

      // Hotcues

      const hotcues = range(8).map((i) => {
        const dx = i % 4
        const dy = ~~(i / 4)
        return bbind.create(Button.buttons[nameOf(offset.x + dx, offset.y + dy + 2)])
      })

      const onHotcueMidi = (i) => (data) => {
        modes(data,
          ({ value }) => {
            if (value) {
              Control.setValue(deck.hotcues[i].activate, 1)
            } else {
              Control.setValue(deck.hotcues[i].activate, 0)
            }
          },
          ({ value }) => {
            if (value) {
              if (boundControls[`hotcues.${i}.enabled`].getValue()) {
                Control.setValue(deck.hotcues[i].clear, 1)
              } else {
                Control.setValue(deck.hotcues[i].set, 1)
              }
            }
          })
      }

      const onHotcueEnabled = (i) => ({ value }) => {
        if (value) {
          Button.send(hotcues[i].button, Button.colors.lo_yellow)
        } else {
          Button.send(hotcues[i].button, Button.colors.black)
        }
      }

      hotcues.forEach((hotcue, i) => {
        controlListeners[`hotcues.${i}.enabled`] = onHotcueEnabled(i)
        buttonListeners[`hotcues.${i}`] = { midi: onHotcueMidi(i) }
        buttons[`hotcues.${i}`] = hotcue
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
  const boundButtons = ButtonBindings({ x: i * 4, y: 0 }, i)
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
