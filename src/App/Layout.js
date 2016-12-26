import { Component } from '../Component'
import { Deck } from './Deck'

export const Layout = (id) => {
  const deck0 = Deck(`${id}.deck.0`, 0)
  return new Component({
    onMount () {
      deck0.mount(this.target)
    },
    onUnmount () {
      deck0.unmount()
    }
  })
}
