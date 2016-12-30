import { Component } from '../Component'
import { ButtonBinding as bbind } from './ButtonBinding'
import { ControlBinding as cbind } from './ControlBinding'
import { Bpm } from '../App/Bpm'

import { Control } from '../Mixxx'
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

const modes = (ctx, n, c, s, cs) => {
  if (ctx.shift && ctx.ctrl) {
    cs && cs()
  } else if (ctx.shift) {
    s && s()
  } else if (ctx.ctrl) {
    c && c()
  } else {
    n()
  }
}

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

const ControlBindings = (id, i) => {
  const deck = Control.controls.decks[i]
  const controls = {
    'play': cbind.create(`${id}.play`, deck.play),
    'playIndicator': cbind.create(`${id}.playIndicator`, deck.play_indicator),
    'cueIndicator': cbind.create(`${id}.cueIndicator`, deck.cue_indicator),
    'syncMode': cbind.create(`${id}.syncMode`, deck.sync_mode),
    'rate': cbind.create(`${id}.rate`, deck.rate),
    'beatActive': cbind.create(`${id}.beatActive`, deck.beat_active),
    'pfl': cbind.create(`${id}.pfl`, deck.pfl),
    'quantize': cbind.create(`${id}.quantize`, deck.quantize)
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
        modes(context,
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

      const onSyncAttack = ({ context }) => {
        modes(context,
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

      const rateEpsilon = 1e-3

      const nudgeButtons = {
        down: {
          binding: bbind.create(Button.buttons[nameOf(offset.x + 2, offset.y)]),
          pressing: false,
          nudging: false
        },
        up: {
          binding: bbind.create(Button.buttons[nameOf(offset.x + 3, offset.y)]),
          pressing: false,
          nudging: false
        }
      }

      const getDirection = (rate) => {
        if (rate < -rateEpsilon) {
          return 'down'
        } else if (rate > rateEpsilon) {
          return 'up'
        } else {
          return ''
        }
      }

      const onNudgeMidi = (dir) => retainAttackMode(({ context, value }) => {
        if (value) {
          nudgeButtons[dir].pressing = true
          if (nudgeButtons.down.pressing && nudgeButtons.up.pressing) {
            Control.setValue(deck.rate, 0)
          } else {
            modes(context,
              () => {
                nudgeButtons[dir].nudging = true
                Button.send(nudgeButtons[dir].binding.button, Button.colors.hi_yellow)
                Control.setValue(deck[`rate_temp_${dir}`], 1)
              },
              () => {
                Button.send(nudgeButtons[dir].binding.button, Button.colors.hi_red)
                Control.setValue(deck[`rate_perm_${dir}`], 1)
              },
              () => {
                nudgeButtons[dir].nudging = true
                Button.send(nudgeButtons[dir].binding.button, Button.colors.lo_yellow)
                Control.setValue(deck[`rate_temp_${dir}_small`], 1)
              },
              () => {
                Button.send(nudgeButtons[dir].binding.button, Button.colors.lo_red)
                Control.setValue(deck[`rate_perm_${dir}_small`], 1)
              }
            )
          }
        } else {
          nudgeButtons[dir].nudging = nudgeButtons[dir].pressing = false
          if (getDirection(boundControls.rate.getValue()) === dir) {
            Button.send(nudgeButtons[dir].binding.button, Button.colors.lo_amber)
          } else {
            Button.send(nudgeButtons[dir].binding.button, Button.colors.black)
          }
          modes(context,
            () => Control.setValue(deck[`rate_temp_${dir}`], 0),
            undefined,
            () => Control.setValue(deck[`rate_temp_${dir}_small`], 0)
          )
        }
      })

      const onRate = ({ value }) => {
        let up = Button.colors.black
        let down = Button.colors.black
        if (value < -rateEpsilon) {
          down = Button.colors.lo_amber
        } else if (value > rateEpsilon) {
          up = Button.colors.lo_amber
        }

        if (!nudgeButtons.down.nudging) {
          Button.send(nudgeButtons.down.binding.button, down)
        }

        if (!nudgeButtons.up.nudging) {
          Button.send(nudgeButtons.up.binding.button, up)
        }
      }

      buttons.nudgeDown = nudgeButtons.down.binding
      buttonListeners.nudgeDown = { midi: onNudgeMidi('down') }

      buttons.nudgeUp = nudgeButtons.up.binding
      buttonListeners.nudgeUp = { midi: onNudgeMidi('up') }

      controlListeners.rate = onRate

      // Cue

      const cue = bbind.create(Button.buttons[nameOf(offset.x, offset.y + 1)])

      const onCueMidi = retainAttackMode(({ context, value }) => {
        modes(context,
          () => {
            if (value) {
              Control.setValue(deck.cue_default, 1)
            } else {
              Control.setValue(deck.cue_default, 0)
            }
          },
          () => value && Control.setValue(deck.cue_set, 1),
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

      // Tap

      const tap = bbind.create(Button.buttons[nameOf(offset.x + 1, offset.y + 1)])
      const tempoBpm = new Bpm()

      const onBeat = ({ value }) => {
        if (value) {
          Button.send(tap.button, Button.colors.hi_red)
        } else {
          Button.send(tap.button, Button.colors.black)
        }
      }

      tempoBpm.on('tap', (avg) => {
        Control.setValue(deck.bpm, avg)
      })

      const onTapAttack = ({ context }) => {
        modes(context,
          () => {
            tempoBpm.tap()
          },
          undefined,
          () => {
            Control.setValue(deck.beats_translate_curpos, 1)
          },
          () => {
            Control.setValue(deck.beats_translate_match_alignment, 1)
          }
        )
      }

      controlListeners.beatActive = onBeat
      buttonListeners.tap = { attack: onTapAttack }
      buttons.tap = tap

      // Grid manipulations

      const gridButtons = {
        back: {
          binding: bbind.create(Button.buttons[nameOf(offset.x + 2, offset.y + 1)]),
          normal: deck.beats_translate_earlier,
          ctrl: deck.beats_adjust_slower
        },
        for: {
          binding: bbind.create(Button.buttons[nameOf(offset.x + 3, offset.y + 1)]),
          normal: deck.beats_translate_later,
          ctrl: deck.beats_adjust_faster
        }
      }
      const onGrid = (dir) => ({ value, context }) => {
        if (!value) {
          Button.send(gridButtons[dir].binding.button, Button.colors.black)
        } else {
          modes(context,
            () => {
              Button.send(gridButtons[dir].binding.button, Button.colors.hi_yellow)
              Control.setValue(gridButtons[dir].normal, 1)
            },
            () => {
              Button.send(gridButtons[dir].binding.button, Button.colors.hi_amber)
              Control.setValue(gridButtons[dir].ctrl, 1)
            })
        }
      }
      buttons.gridBack = gridButtons.back.binding
      buttonListeners.gridBack = { midi: onGrid('back') }

      buttons.gridFor = gridButtons.for.binding
      buttonListeners.gridFor = { midi: onGrid('for') }

      // Hotcues

      const hotcues = range(8).map((i) => {
        const dx = i % 2
        const dy = ~~(i / 2)
        return bbind.create(Button.buttons[nameOf(offset.x + dx, offset.y + dy + 4)])
      })

      const onHotcueMidi = (i) => ({ context, value }) => {
        modes(context,
          () => {
            if (value) {
              Control.setValue(deck.hotcues[i].activate, 1)
            } else {
              Control.setValue(deck.hotcues[i].activate, 0)
            }
          },
          () => {
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

      // PFL

      const pfl = bbind.create(Button.buttons[nameOf(offset.x, offset.y + 2)])

      const onPflAttack = ({ context }) => modes(context,
        () => boundControls.pfl.setValue(Number(!boundControls.pfl.getValue())))

      const onPfl = ({ value }) => value
        ? Button.send(pfl.button, Button.colors.hi_green)
        : Button.send(pfl.button, Button.colors.black)

      buttons.pfl = pfl
      buttonListeners.pfl = { attack: onPflAttack }
      controlListeners.pfl = onPfl

      // Quantize

      const quantize = bbind.create(Button.buttons[nameOf(offset.x + 1, offset.y + 2)])

      const onQuantizeAttack = ({ context }) => modes(context,
        () => boundControls.quantize.setValue(Number(!boundControls.quantize.getValue())))

      const onQuantize = ({ value }) => value
        ? Button.send(quantize.button, Button.colors.hi_orange)
        : Button.send(quantize.button, Button.colors.black)

      buttons.quantize = quantize
      buttonListeners.quantize = { attack: onQuantizeAttack }
      controlListeners.quantize = onQuantize

      // PFL
      // Beatjumps
      // const beatjumps = [
      //   {
      //     binding: bbind.create(Button.buttons[nameOf(offset.x, offset.y + 4)]),
      //     normal: -4,
      //     ctrl: -16,
      //     shift: -0.25
      //   },
      //   {
      //     binding: bbind.create(Button.buttons[nameOf(offset.x + 1, offset.y + 4)]),
      //     normal: -1,
      //     ctrl: -8,
      //     shift: -0.5
      //   },
      //   {
      //     binding: bbind.create(Button.buttons[nameOf(offset.x + 2, offset.y + 4)]),
      //     normal: 1,
      //     ctrl: 8,
      //     shift: 0.5
      //   },
      //   {
      //     binding: bbind.create(Button.buttons[nameOf(offset.x + 3, offset.y + 4)]),
      //     normal: 4,
      //     ctrl: 16,
      //     shift: 0.25
      //   }
      // ]
      //
      // const onBeatjumpAttack = (beatjump) => (data) => {
      //   if (!data.value) {
      //     Button.send(beatjump.binding, Button.colors.black)
      //   } else {
      //     modes(data,
      //       () => {
      //         Button.send(beatjump.binding, Button.colors.hi_green)
      //         Control.setValue(deck.beatjump, beatjump.normal)
      //       },
      //       () => {
      //         Button.send(beatjump.binding, Button.colors.hi_yellow)
      //         Control.setValue(deck.beatjump, beatjump.normal)
      //       },
      //       () => {
      //         Button.send(beatjump.binding, Button.colors.hi_red)
      //         Control.setValue(deck.beatjump, beatjump.normal)
      //       }
      //     )
      //   }
      // }
      //
      // beatjumps.forEach((beatjump) => {
      //   buttonListeners[`hotcues.${i}`] = { attack: onBeatjumpAttack(beatjump) }
      //   buttons[`beatjump.${beatjump.normal}`] = beatjump.binding
      // })

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
