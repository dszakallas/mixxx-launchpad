import { numDecks } from "@mixxx-launch/mixxx/src/Control"

export type VerticalGroupParams = {
  template: number,
  columnOffset: number,
  numDecks: number,
}

export const defaultVerticalGroupParams: VerticalGroupParams = {
  template: 0,
  columnOffset: 0,
  numDecks: numDecks,
}
