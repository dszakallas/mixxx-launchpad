import { PlaylistSidebar } from './PlaylistSidebar'
import { ModifierSidebar } from './ModifierSidebar'
import { Layout } from './Layout'
import { Component } from '../Component'

import assign from 'lodash.assign'

export const ModifierPlugin = (modifier) => {
  let ctrl = false
  let shift = false
  modifier.on('ctrl', (value) => { ctrl = !!value })
  modifier.on('shift', (value) => { shift = !!value })
  return {
    press: (value, button, context) => {
      return { value, button, context: assign(context, { shift, ctrl }) }
    }
  }
}

export const Screen = (id) => (timer) => {
  const modifierSidebar = ModifierSidebar()
  const modifierPlugin = ModifierPlugin(modifierSidebar)
  const playListSidebar = PlaylistSidebar(timer)
  const layout = Layout(`${id}.layout`)
  return new Component({
    onMount () {
      this.target.launchpadBus.addPlugin(`${id}.modifierPlugin`, modifierPlugin)
      modifierSidebar.mount(this.target.launchpadBus)
      playListSidebar.mount(this.target)
      layout.mount(this.target)
    },
    onUnmount () {
      layout.unmount()
      playListSidebar.unmount()
      modifierSidebar.unmount()
      this.target.launchpadBus.removePlugin(`${id}.modifierPlugin`)
    }
  })
}
