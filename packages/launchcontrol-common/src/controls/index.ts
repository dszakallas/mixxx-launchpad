import { Eq3KillType, Eq3Type, GainType, makeEq3, makeEq3Kill, makeGain } from "./deck"
import { FxMeta3Type, FxMixType, FxSuperType, QuickFxSuperType, makeFxMeta3, makeFxMix, makeFxSuper, makeQuickFxSuper } from "./fx"
import { MakeControlTemplate } from '@mixxx-launch/launch-common/src/Control'

export type ControlTypeIndex = |
  Eq3Type |
  Eq3KillType |
  GainType |
  FxMeta3Type |
  FxMixType |
  QuickFxSuperType |
  FxSuperType

export type MakeControlTemplateIndex = { [C in ControlTypeIndex as C['type']]: MakeControlTemplate<C> }

export const index: MakeControlTemplateIndex = {
  eq3: makeEq3,
  eq3Kill: makeEq3Kill,
  gain: makeGain,
  fxMeta3: makeFxMeta3,
  fxMix: makeFxMix,
  quickFxSuper: makeQuickFxSuper,
  fxSuper: makeFxSuper
} as const


export type ControlConf = {
  type: ControlTypeIndex['type']
  params?: Omit<ControlTypeIndex['params'], 'template'>
}
