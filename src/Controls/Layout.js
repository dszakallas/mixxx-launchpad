import { Component } from '../Component'
import { Deck } from './Deck'

export const Layout = (id) => {
  const deck = Deck(`${id}.deck1`, 0)
  return new Component({
    onMount () {
      deck.mount(this.target)
    },
    onUnmount () {
      deck.unmount()
    }

  })
}
