import { ButtonBinding as bbind } from '../Controls/ButtonBinding'
import { Button } from '../Launchpad'
import { Component } from '../Component'

export function ModifierSidebar () {
  const shift = bbind.create(Button.buttons.solo)
  const ctrl = bbind.create(Button.buttons.arm)

  const emit = ({ value, button }) => {
    if (value) {
      Button.send(button, Button.colors.hi_red)
    } else {
      Button.send(button, Button.colors.black)
    }
    if (button.toString() === Button.buttons.solo.toString()) {
      component.emit('shift', value)
    } else {
      component.emit('ctrl', value)
    }
  }

  const component = new Component({
    onMount () {
      shift.mount(this.target)
      ctrl.mount(this.target)

      shift.on('midi', emit)
      ctrl.on('midi', emit)
    },
    onUnmount () {
      shift.removeListener('midi', emit)
      ctrl.removeListener('midi', emit)

      shift.unmount()
      ctrl.unmount()
    }
  })
  return component
}
