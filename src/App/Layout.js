import { Component } from '../Component'
import { Button } from '../Launchpad'
import { Deck } from './Deck'
import { ButtonBinding as bbind } from '../Controls/ButtonBinding'

export const Layout = (id) => {
  const deck0 = Deck(`${id}.deck.0`, 0)
  let selected = 'up'
  const buttons = [
    'up', 'down', 'left', 'right',
    'session', 'user1', 'user2', 'mixer'
  ]
    .map((v, i) => {
      const button = Button.buttons[v]
      const binding = bbind.create(button)

      binding.on('mount', () => {
        if (selected === v) {
          Button.send(button, Button.colors.hi_yellow)
        }
      })

      binding.on('midi', ({ value }) => {
        if (value) {
          Button.send(Button.buttons[selected], Button.colors.black)
          Button.send(button, Button.colors.hi_green)
          selected = v
        } else {
          if (selected === v) {
            Button.send(button, Button.colors.hi_yellow)
          } else {
            Button.send(button, Button.colors.black)
          }
        }
      })
      return binding
    })
  return new Component({
    onMount () {
      buttons.forEach((b) => b.mount(this.target.launchpadBus))
      deck0.mount(this.target)
    },
    onUnmount () {
      buttons.forEach((b) => b.unmount())
      deck0.unmount()
    }
  })
}
