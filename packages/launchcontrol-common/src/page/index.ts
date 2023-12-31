import { Component } from "@mixxx-launch/mixxx";
import { LaunchControlDevice } from "../device";
import { FxParamPageConf, makeFxParamPage } from "./fxParam";
import { GenericPageConf, makeGenericPage } from "./generic";
import { PadSelectorPageConf, makePadSelectorPage } from "./padSelector"

export type MakePage<C extends PageConf> = (conf: C, template: number, device: LaunchControlDevice) => Component

export type PageConf = GenericPageConf | PadSelectorPageConf | FxParamPageConf

export type MakePageIndex = { [C in PageConf as C['type']]: MakePage<C> }

export const makePageIndex: MakePageIndex = {
  genericPage: makeGenericPage,
  fxParamPage: makeFxParamPage,
  padSelectorPage: makePadSelectorPage,
} as const

