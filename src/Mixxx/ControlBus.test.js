import test from 'ava'
import sinon from 'sinon'

import { ControlBus } from './ControlBus'
import { Controls } from './Controls'
import { callbackPrefix } from './prefixes'

const Playlist = Controls.Playlist

test('ControlBus registers callback', (t) => {
  const registry = { }
  const engine = { connectControl: sinon.stub() }

  const cb = sinon.stub()

  const mixxx = ControlBus.create('NovationLaunchpad', registry)

  mixxx.register('cb', Playlist.SelectNextTrack, cb)

  t.is(engine.connectControl.callCount, 1)
  t.deepEqual(engine.connectControl.args[0],
    [Playlist.SelectNextTrack.group, Playlist.SelectNextTrack.name,
      `NovationLaunchpad.${callbackPrefix}_${Playlist.SelectNextTrack.group}_${Playlist.SelectNextTrack.name}`])

  registry[`${callbackPrefix}_${Playlist.SelectNextTrack.group}_${Playlist.SelectNextTrack.name}`]()

  t.is(cb.callCount, 1)
})

test('ControlBus unregisters callback', (t) => {
  const registry = { }
  const engine = { connectControl: sinon.stub() }

  const cb = sinon.stub()

  const mixxx = ControlBus.create('NovationLaunchpad', registry)

  const handle = mixxx.register('cb', Playlist.SelectNextTrack, cb)

  mixxx.unregister(handle)

  t.is(engine.connectControl.callCount, 2)
  t.deepEqual(engine.connectControl.args[1],
    [Playlist.SelectNextTrack.group, Playlist.SelectNextTrack.name, `NovationLaunchpad.${callbackPrefix}_${Playlist.SelectNextTrack.group}_${Playlist.SelectNextTrack.name}`, true])
})

test('ControlBus registers multiple callbacks', (t) => {
  const registry = { }
  const engine = { connectControl: sinon.stub() }

  const cb1 = sinon.stub()
  const cb2 = sinon.stub()

  const mixxx = ControlBus.create('NovationLaunchpad', registry)

  mixxx.register('cb1', Playlist.SelectNextTrack, cb1)
  mixxx.register('cb2', Playlist.SelectNextTrack, cb2)

  registry[`${callbackPrefix}_${Playlist.SelectNextTrack.group}_${Playlist.SelectNextTrack.name}`]()

  t.is(cb1.callCount, 1)
  t.is(cb2.callCount, 1)
})

test('ControlBus replaces callback', (t) => {
  const registry = { }
  const engine = { connectControl: sinon.stub() }

  const cb1 = sinon.stub()
  const cb2 = sinon.stub()

  const mixxx = ControlBus.create('NovationLaunchpad', registry)

  mixxx.unregister(mixxx.register('cb1', Playlist.SelectNextTrack, cb1))

  mixxx.register('cb2', Playlist.SelectNextTrack, cb2)

  registry[`${callbackPrefix}_${Playlist.SelectNextTrack.group}_${Playlist.SelectNextTrack.name}`]()

  t.is(cb1.callCount, 0)
  t.is(cb2.callCount, 1)
})
