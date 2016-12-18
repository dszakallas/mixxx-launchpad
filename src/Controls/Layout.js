import { Component } from '../Component'
import { Deck } from './Deck'

export const Layout = (id) => {
  const deck0 = Deck(`${id}.deck.0`, 0)
  const deck1 = Deck(`${id}.deck.1`, 1)
  return new Component({
    onMount () {
      deck0.mount(this.target)
      deck1.mount(this.target)
    },
    onUnmount () {
      deck0.unmount()
      deck1.unmount()
    }
  })
}
