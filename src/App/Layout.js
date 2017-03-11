import Component from '../Component'
import bbind from '../Controls/ButtonBinding'
import { Button } from '../Launchpad'
import flatMap from 'lodash.flatmap'
import assign from 'lodash.assign'
import isEqual from 'lodash.isequal'
import pick from 'lodash.pick'
import findIndex from 'lodash.findindex'

import Grande from './presets/Grande'
import Juggler from './presets/Juggler'
import Sampler from './presets/Sampler'
import Short from './presets/Short'
import Tall from './presets/Tall'

import modes from '../Utility/modes'
import retainAttackMode from '../Utility/retainAttackMode'

const initialChannels = [0, 1]

const onMidi = (selectorBar, channel) => retainAttackMode(({ value, context }) => {
  const selected = selectorBar.getChord()
  modes(context,
    () => {
      if (!value && selected.length) {
        const diff = reorganize(selectorBar.getLayout(), selected)
        selectorBar.updateLayout(diff)
        selectorBar.removeChord()
      } else if (value) {
        selectorBar.addToChord(channel)
      }
    },
    () => {
      if (value) {
        if (selected.length) selectorBar.removeChord()
        const diff = cycle(channel, selectorBar.getLayout(), 1)
        selectorBar.updateLayout(diff)
      }
    },
    () => {
      if (value) {
        if (selected.length) selectorBar.removeChord()
        const diff = cycle(channel, selectorBar.getLayout(), -1)
        selectorBar.updateLayout(diff)
      }
    }
  )
})

class SelectorBar extends Component {
  static get buttons () {
    return [
      'up', 'down', 'left', 'right',
      'session', 'user1', 'user2', 'mixer'
    ]
  }

  static get channels () {
    return [0, 1, 2, 3, 4, 5, 6, 7]
  }

  constructor (id, channel) {
    super()
    this.id = id
    this.bindings = SelectorBar.buttons
      .map((v, i) => {
        const binding = bbind.create(Button.buttons[v])
        return [binding, onMidi(this, i, binding)]
      })
    this.chord = []
    this.layout = { }
    this.mountedPresets = { }
  }

  getLayout () {
    const res = []
    for (const k in this.layout) {
      res.push(this.layout[k])
    }
    return res
  }

  updateLayout (diff) {
    const removedChannels = diff[0].map((block) => block.channel)
    removedChannels.forEach((ch) => {
      delete this.layout[ch]
      Button.send(this.bindings[ch][0].button, Button.colors.black)
      this.mountedPresets[ch].unmount()
      this.mountedPresets[ch] = undefined
    })
    const addedBlocks = diff[1]
    addedBlocks.forEach((block) => {
      this.layout[block.channel] = block
      if (block.index) {
        Button.send(this.bindings[block.channel][0].button, Button.colors.hi_orange)
      } else {
        Button.send(this.bindings[block.channel][0].button, Button.colors.hi_green)
      }
      this.mountedPresets[block.channel] = cycled[block.size][block.index](
        `${this.id}.deck.${block.channel}`,
        block.channel,
        block.offset
      )
      this.mountedPresets[block.channel].mount(this.target)
    })
  }

  removeChord () {
    const layout = this.getLayout()
    this.chord.forEach((ch) => {
      const found = findIndex(layout, (b) => b.channel === ch)
      if (found === -1) {
        Button.send(this.bindings[ch][0].button, Button.colors.black)
      } else {
        const block = layout[found]
        if (block.index) {
          Button.send(this.bindings[ch][0].button, Button.colors.hi_orange)
        } else {
          Button.send(this.bindings[ch][0].button, Button.colors.hi_green)
        }
      }
      this.chord = []
    })
  }

  addToChord (channel) {
    if (this.chord.length === 4) {
      const rem = this.chord.shift()
      const found = findIndex(this.layout, (b) => b.channel === rem)
      if (found === -1) {
        Button.send(this.bindings[rem][0].button, Button.colors.black)
      } else {
        const layout = this.layout[found]
        if (layout.index) {
          Button.send(this.bindings[rem][0].button, Button.colors.hi_orange)
        } else {
          Button.send(this.bindings[rem][0].button, Button.colors.hi_green)
        }
      }
    }
    this.chord.push(channel)
    Button.send(this.bindings[channel][0].button, Button.colors.hi_red)
  }

  getChord () {
    return this.chord
  }

  onMount () {
    this.bindings.forEach(([binding, midi]) => {
      binding.mount(this.target.launchpadBus)
      binding.on('midi', midi)
    })
    return this.bindings
  }

  onUnmount () {
    this.bindings.forEach(([binding, midi]) => {
      binding.removeListener('midi', midi)
      binding.unmount()
    })
  }
}

export default (id) => {
  const selectorBar = new SelectorBar(`${id}.selectorBar`)

  return new Component({
    onMount () {
      selectorBar.mount(this.target)
      const diff = reorganize([], initialChannels)
      selectorBar.updateLayout(diff)
    },
    onUnmount () {
      const diff = reorganize(selectorBar.getLayout(), [])
      selectorBar.updateLayout(diff)
      selectorBar.unmount()
    }
  })
}

const offsets = [
  [0, 0],
  [4, 0],
  [0, 4],
  [4, 4]
]

const presets = {
  grande: [ Grande ],
  tall: [ Tall, Juggler ],
  short: [ Short, Sampler ]
}

const cycled = {
  'grande': flatMap(pick(presets, ['grande', 'tall', 'short']), (x) => x),
  'tall': flatMap(pick(presets, ['tall', 'short']), (x) => x),
  'short': flatMap(pick(presets, ['short']), (x) => x)
}

const reorganize = (current, selectedChannels) => {
  const next = selectedChannels.length <= 1
    ? [{
      offset: offsets[0],
      size: 'grande',
      channel: selectedChannels[0],
      index: 0
    }]
    : selectedChannels.length <= 2
      ? [{
        offset: offsets[0],
        size: 'tall',
        channel: selectedChannels[0],
        index: 0
      }, {
        offset: offsets[1],
        size: 'tall',
        channel: selectedChannels[1],
        index: 0
      }]
      : selectedChannels.length <= 3
        ? [{
          offset: offsets[0],
          size: 'tall',
          channel: selectedChannels[0],
          index: 0
        }, {
          offset: offsets[1],
          size: 'short',
          channel: selectedChannels[1],
          index: 0
        }, {
          offset: offsets[3],
          size: 'short',
          channel: selectedChannels[2],
          index: 0
        }]
        : [{
          offset: offsets[0],
          size: 'short',
          channel: selectedChannels[0],
          index: 0
        }, {
          offset: offsets[1],
          size: 'short',
          channel: selectedChannels[1],
          index: 0
        }, {
          offset: offsets[2],
          size: 'short',
          channel: selectedChannels[2],
          index: 0
        }, {
          offset: offsets[3],
          size: 'short',
          channel: selectedChannels[3],
          index: 0
        }]
  return current.reduce((diff, block) => {
    const [neg, pos] = diff
    const matched = findIndex(pos, (b) => isEqual(block, b))
    return matched === -1
    ? [neg.concat([block]), pos]
    : [neg, pos.slice(0, matched).concat(pos.slice(matched + 1, pos.length))]
  }, [[], next])
}

const cycle = (channel, current, dir) => {
  const matched = findIndex(current, (block) => block.channel === channel)
  if (matched === -1) {
    return [[], []]
  }
  const nextIndex = (current[matched].index + dir) % cycled[current[matched].size].length
  if (nextIndex === current[matched].index) {
    return [[], []]
  }
  return [[current[matched]], [assign({}, current[matched], { index: nextIndex })]]
}
