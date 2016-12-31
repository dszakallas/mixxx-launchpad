import Component from '../Component'
import bbind from './ButtonBinding'
import cbind from './ControlBinding'
import { Button } from '../Launchpad'

export default (id, template) => {
  const { controlBindings, buttonBindings, controlListeners, buttonListeners } = initTemplate(id, template)
  return new Component({
    onMount () {
      const { launchpadBus, controlBus } = this.target
      addListeners(controlBindings, controlListeners)
      addListeners(buttonBindings, buttonListeners)
      Object.keys(controlBindings).forEach((k) => controlBindings[k].mount(controlBus))
      Object.keys(buttonBindings).forEach((k) => buttonBindings[k].mount(launchpadBus))
    },
    onUnmount () {
      Object.keys(controlBindings).forEach((k) => controlBindings[k].unmount())
      Object.keys(buttonBindings).forEach((k) => buttonBindings[k].unmount())
      removeListeners(controlBindings, controlListeners)
      removeListeners(buttonBindings, buttonListeners)
    }
  })
}

const initTemplate = (id, template) => {
  const controlBindings = {}
  const controlListeners = {}
  const buttonBindings = {}
  const buttonListeners = {}
  Object.keys(template).forEach((tk) => {
    if (template[tk] && template[tk].bindings) {
      const bindings = template[tk].bindings
      const instance = {
        state: template[tk].state,
        bindings: {}
      }
      Object.keys(bindings).forEach((bk) => {
        if (bindings[bk]) {
          const binding = bindings[bk]
          if (binding.type === 'control') {
            const name = `${binding.target.group}${binding.target.name}`
            if (!controlBindings[name]) {
              controlBindings[name] = cbind.create(`${id}.${tk}.${bk}`, binding.target)
            }
            instance.bindings[bk] = controlBindings[name]
            controlListeners[name] = controlListeners[name] || { }
            ;['update', 'mount', 'unmount'].forEach((action) => {
              if (typeof binding[action] === 'function') {
                appendListener(action, controlListeners[name], function (data) {
                  return binding[action](data, instance)
                })
              }
            })
          } else if (binding.type === 'button') {
            const name = nameOf(binding.target[0], binding.target[1])
            if (!buttonBindings[name]) {
              buttonBindings[name] = bbind.create(Button.buttons[name])
            }
            instance.bindings[bk] = buttonBindings[name]
            buttonListeners[name] = buttonListeners[name] || { }
            ;['attack', 'release', 'midi', 'mount', 'unmount'].forEach((action) => {
              if (typeof binding[action] === 'function') {
                appendListener(action, buttonListeners[name], function (data) {
                  return binding[action](data, instance)
                })
              }
            })
          }
        }
      })
    }
  })
  return { controlBindings, controlListeners, buttonBindings, buttonListeners }
}

const nameOf = (x, y) => `${7 - y},${x}`

const appendListener = (type, bindings, binding) => {
  if (bindings[type] && Array.isArray(bindings[type])) {
    bindings[type].push(binding)
  } else if (bindings[type]) {
    const first = bindings[type]
    bindings[type] = [first, binding]
  } else {
    bindings[type] = binding
  }
}

const addListeners = (tgt, bindings) => {
  Object.keys(bindings).forEach((binding) => {
    if (tgt[binding]) {
      Object.keys(bindings[binding]).forEach((k) => {
        if (Array.isArray(bindings[binding][k])) {
          bindings[binding][k].forEach((f) => {
            tgt[binding].on(k, f)
          })
        } else {
          tgt[binding].on(k, bindings[binding][k])
        }
      })
    }
  })
}

const removeListeners = (tgt, bindings) => {
  Object.keys(bindings).forEach((binding) => {
    if (tgt[binding]) {
      Object.keys(bindings[binding]).forEach((k) => {
        if (Array.isArray(bindings[binding][k])) {
          bindings[binding][k].forEach((f) => {
            tgt[binding].removeListener(k, f)
          })
        } else {
          tgt[binding].removeListener(k, bindings[binding][k])
        }
      })
    }
  })
}
