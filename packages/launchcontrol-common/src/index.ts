import { map, range } from '@mixxx-launch/common'
import { Control as BaseControl, ControlTemplate } from '@mixxx-launch/launch-common/src/Control'
import { Component, MidiControlDef } from '@mixxx-launch/mixxx'
import { ControlContext } from './Control'
import { Eq3KillType, makeEq3Kill } from './controls/deck'
import { FxEnablerType, FxSelectorType, makeFxEnabler, makeFxSelector } from './controls/fx'
import { LaunchControlDevice } from './device'
import { PadSelectorPageConf } from './page/padSelector'
import { makePager } from './pager'
import { MakeComponent, makeContainer } from './util'

type MakePage = (template: number) => MakeComponent

const statelessFreePage =
  (makePage: MakePage): MakeComponent =>
  (device: LaunchControlDevice): Component => {
    return new (class extends Component {
      _device: LaunchControlDevice
      _inner: Component | null
      constructor(device: LaunchControlDevice) {
        super()
        this._device = device
        this._inner = null
      }

      onTemplate(template: number) {
        if (this._inner) {
          this._inner.unmount()
          this._inner = makePage(template)(this._device)
          this._inner.mount()
        }
      }
      onMount() {
        super.onMount()
        this._inner = makePage(this._device.template)(this._device)
        this._inner.mount()
        this._device.addListener('template', this.onTemplate.bind(this))
      }

      onUnmount() {
        this._device.removeListener('template', this.onTemplate.bind(this))
        if (this._inner) {
          this._inner.unmount()
          this._inner = null
        }
        super.onUnmount()
      }
    })(device)
  }

const makeEq3KillLegacy = (
  device: LaunchControlDevice,
  template: number,
  row: number,
  column: number,
  deck: number,
) => {
  const eq3 = makeEq3Kill({ template, row, column, deck })
  return new BaseControl<ControlContext, Eq3KillType>(eq3.bindings, eq3.state, { device })
}

const makeFxEnablerLegacy = (
  device: LaunchControlDevice,
  template: number,
  row: number,
  column: number,
  deck: number,
) => {
  const fxEnabler: ControlTemplate<ControlContext, FxEnablerType> = makeFxEnabler({ template, row, column, deck })
  return new BaseControl<ControlContext, FxEnablerType>(fxEnabler.bindings, fxEnabler.state, { device })
}

const makeFxSelectorLegacy = (
  device: LaunchControlDevice,
  template: number,
  row: number,
  column: number,
  deck: number,
) => {
  const fxSelector = makeFxSelector({ template, row, column, deck })
  return new BaseControl<ControlContext, FxSelectorType>(fxSelector.bindings, fxSelector.state, { device })
}

const pages = [
  {
    type: 'genericPage',
    controls: [
      ...map((i) => ({ type: 'eq3' as const, params: { column: i, deck: i } }), range(4)),
      ...map((i) => ({ type: 'gain' as const, params: { column: i, deck: i } }), range(4)),
      ...map((i) => ({ type: 'fxMeta3' as const, params: { column: i + 4, unit: i } }), range(4)),
      ...map((i) => ({ type: 'fxMix' as const, params: { column: i + 4, unit: i } }), range(4)),
    ],
  },
  {
    type: 'genericPage',
    controls: [
      ...map((i) => ({ type: 'eq3' as const, params: { column: i, deck: i } }), range(4)),
      ...map((i) => ({ type: 'gain' as const, params: { column: i, deck: i } }), range(4)),
      ...map((i) => ({ type: 'quickFxSuper' as const, params: { column: i + 4, row: 0, unit: i } }), range(4)),
      ...map((i) => ({ type: 'fxSuper' as const, params: { column: i + 4, row: 1, unit: i } }), range(4)),
      ...map((i) => ({ type: 'fxMix' as const, params: { column: i + 4, unit: i } }), range(4)),
    ],
  },
  {
    type: 'fxParamPage',
  },
] as const

const padSelectorPage = {
  type: 'padSelectorPage',
  initialSelection: 0,
  pads: [
    statelessFreePage((template) => (device) => {
      return makeContainer([
        makeFxSelectorLegacy(device, template, 0, 0, 0),
        makeFxSelectorLegacy(device, template, 0, 4, 1),
        makeFxSelectorLegacy(device, template, 1, 0, 2),
        makeFxSelectorLegacy(device, template, 1, 4, 3),
      ])
    }),
    statelessFreePage((template) => (device) => {
      return makeContainer([
        makeEq3KillLegacy(device, template, 0, 0, 0),
        makeEq3KillLegacy(device, template, 0, 4, 1),
        makeEq3KillLegacy(device, template, 1, 0, 2),
        makeEq3KillLegacy(device, template, 1, 4, 3),
      ])
    }),
    statelessFreePage((template) => (device) => {
      return makeContainer([
        makeFxEnablerLegacy(device, template, 0, 0, 0),
        makeFxEnablerLegacy(device, template, 0, 4, 1),
        makeFxEnablerLegacy(device, template, 1, 0, 2),
        makeFxEnablerLegacy(device, template, 1, 4, 3),
      ])
    }),
  ],
} as PadSelectorPageConf

const makeApp = (device: LaunchControlDevice) =>
  makeContainer([makePager(pages, 16)(device), makePager([padSelectorPage])(device)])

export type ControllerControlDef = [number, number]

export const convertControlDef = (name: string, [status, midino]: ControllerControlDef): MidiControlDef => ({
  name,
  status,
  midino,
})

export const useDevice = (device: LaunchControlDevice) => {
  const app = makeApp(device)
  device.addListener('mount', app.mount.bind(app))
  device.addListener('unmount', app.unmount.bind(app))
  return device
}

export { LaunchControlDevice }
