import { ButtonListener } from './ButtonListener'
import { buttons, colors } from '../Launchpad'

const update = (state) => (value, button, id, context, launchpad) => {
  if (!value) {
    return
  }
  if (state[button[2]]) {
    state[button[2]] = false
    launchpad.sendMidi(button, colors.black)
    return
  }
  state[button[2]] = true
  if (!context) {
    launchpad.sendMidi(button, colors.hi_amber)
    return
  }

  if (context.shift && context.ctrl) {
    launchpad.sendMidi(button, colors.hi_orange)
  } else if (context.ctrl) {
    launchpad.sendMidi(button, colors.hi_green)
  } else if (context.shift) {
    launchpad.sendMidi(button, colors.hi_yellow)
  } else {
    launchpad.sendMidi(button, colors.hi_amber)
  }
}

const init = () => {}

const destruct = (button, launchpad) => launchpad.sendMidi(button, colors.black)

export const MainControl = (id) => {
  let btns = []
  for (let i = 0; i < 64; ++i) {
    btns.push(`${Math.floor(i / 8)},${i % 8}`)
  }
  const state = {
  }

  btns = btns.map((name) => ButtonListener(`${id}.${name}`, buttons[name])(update(state), init, destruct))

  return (mixxx, launchpad) => {
    const btnInstances = btns.map((btn) => btn(launchpad))
    return {
      mount () {
        btnInstances.forEach((btnInst) => btnInst.mount())
      },
      unmount () {
        btnInstances.forEach((btnInst) => btnInst.unmount())
      }
    }
  }
}
