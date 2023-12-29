import { Control as BaseControl, ControlTemplate } from '@mixxx-launch/launch-common/src/Control'
import { makeBindings } from "../Control"
import { ControlConf, ControlTypeIndex, index } from "../controls"
import { LaunchControlDevice } from "../device"
import { Container } from "../util"


export type GenericPageConf = {
  type: 'genericPage'
  controls: readonly ControlConf[]
}

export const makeGenericPage = (p: GenericPageConf, template: number, device: LaunchControlDevice) => new Container(p.controls.map(c => {
  const ct: ControlTemplate<ControlTypeIndex> = index[c.type](Object.assign({ template }, c.params) as unknown as any)
  return new BaseControl(makeBindings as unknown as any, ct.bindings, ct.state as unknown as any, { device })
}))
