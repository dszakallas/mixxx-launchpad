import test from 'ava'
import sinon from 'sinon'

import { Engine as Launchpad } from './engine'
import { buttons } from './buttons'

const callbackPrefix = require('../../package.json').mixxx.callbackPrefix

test('Launchpad registers callbacks for all buttons', (t) => {
  const registry = { }
  const midi = { }

  Launchpad.create(midi, registry)

  const buttonKeys = Object.keys(buttons)

  t.plan(buttonKeys.length)

  buttonKeys.map((name) => buttons[name]).forEach((button) => {
    t.true(typeof registry[`${callbackPrefix}_${button[0]}_${button[1]}`] === 'function')
  })
})

test('Launchpad registers callback', (t) => {
  const registry = { }
  const midi = { }

  const cb = sinon.stub()

  const lp = Launchpad.create(midi, registry)

  lp.register('cb', buttons.user2, cb)

  registry[`${callbackPrefix}_${buttons.user2[0]}_${buttons.user2[1]}`]()

  t.is(cb.callCount, 1)
})

test('Launchpad unregisters callback', (t) => {
  const registry = { name: 'NovationLaunchpad' }
  const midi = { }

  const cb = sinon.stub()

  const lp = Launchpad.create(midi, registry)

  lp.unregister(lp.register('cb', buttons.user2, cb))

  registry[`${callbackPrefix}_${buttons.user2[0]}_${buttons.user2[1]}`]()

  t.is(cb.callCount, 0)
})

test('Launchpad registers multiple callbacks', (t) => {
  const registry = { }
  const midi = { }

  const cb1 = sinon.stub()
  const cb2 = sinon.stub()

  const lp = Launchpad.create(midi, registry)

  lp.register('cb1', buttons.user2, cb1)
  lp.register('cb2', buttons.user2, cb2)

  registry[`${callbackPrefix}_${buttons.user2[0]}_${buttons.user2[1]}`]()

  t.is(cb1.callCount, 1)
  t.is(cb2.callCount, 1)
})

test('Launchpad replaces callback', (t) => {
  const registry = { }
  const midi = { }

  const cb1 = sinon.stub()
  const cb2 = sinon.stub()

  const lp = Launchpad.create(midi, registry)

  lp.unregister(lp.register('cb', buttons.user2, cb1))
  lp.register('cb', buttons.user2, cb2)

  registry[`${callbackPrefix}_${buttons.user2[0]}_${buttons.user2[1]}`]()

  t.is(cb1.callCount, 0)
  t.is(cb2.callCount, 1)
})
