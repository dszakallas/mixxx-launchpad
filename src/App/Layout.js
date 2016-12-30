import { Component } from '../Component'
import { Button } from '../Launchpad'
import { Deck } from './Deck'
import { ButtonBinding as bbind } from '../Controls/ButtonBinding'

export const Layout = (id) => {
  let selected = 0
  const listeners = []
  const buttons = [
    'up', 'down', 'left', 'right',
    'session', 'user1', 'user2', 'mixer'
  ]
  const onMidi = (target, i) => ({ value }) => {
    const button = controls[i].button.button
    if (value) {
      Button.send(Button.buttons[buttons[selected]], Button.colors.black)
      Button.send(button, Button.colors.hi_green)
      if (selected !== i) {
        console.log('changing deck')
        controls[selected].deck.unmount()
        selected = i
        controls[i].deck.mount(target)
      } else {
        console.log('not changing')
      }
    } else {
      if (selected === i) {
        Button.send(button, Button.colors.hi_yellow)
      } else {
        Button.send(button, Button.colors.black)
      }
    }
  }
  const controls = buttons.map((v, i) => {
    const button = Button.buttons[v]
    const binding = bbind.create(button)

    binding.on('mount', () => {
      if (selected === i) {
        Button.send(button, Button.colors.hi_yellow)
      }
    })
    const deck = Deck(`${id}.deck.${i}`, i)
    return {
      button: binding,
      deck
    }
  })
  return new Component({
    onMount () {
      controls[selected].deck.mount(this.target)
      controls.forEach((c, i) => {
        listeners[i] = onMidi(this.target, i)
        c.button.on('midi', listeners[i])
        c.button.mount(this.target.launchpadBus)
      })
    },
    onUnmount () {
      controls.forEach(
        (c, i) => {
          c.button.unmount()
          c.button.removeListener('midi', listeners[i])
          delete listeners[i]
        })
      controls[selected].deck.unmount()
    }
  })
}
