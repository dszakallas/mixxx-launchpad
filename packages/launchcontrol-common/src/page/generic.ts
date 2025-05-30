import { Control as BaseControl } from '@mixxx-launch/launch-common/src/Control'
import { ControlConf, index } from '../controls'
import { LaunchControlDevice } from '../device'
import { Container } from '@mixxx-launch/common/component'

export type GenericPageConf = {
  type: 'genericPage'
  controls: readonly ControlConf[]
}

export const makeGenericPage = (p: GenericPageConf, template: number, device: LaunchControlDevice) =>
  new Container(
    p.controls.map((c) => {
      const ct = index[c.type](Object.assign({ template }, c.params) as unknown as any) // eslint-disable-line
      return new BaseControl(ct.bindings, ct.state as unknown as any, { device }) // eslint-disable-line
    }),
  )
