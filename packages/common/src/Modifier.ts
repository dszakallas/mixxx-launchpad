export enum ModifierState {
  None = 0,
  Shift = 1,
  Ctrl = 2,
  ShiftCtrl = 3,
}

export interface Modifier {
  getState(): ModifierState
}

export const modes = (ctx: ModifierState, n?: () => void, c?: () => void, s?: () => void, cs?: () => void) => {
  switch (ctx) {
    case ModifierState.ShiftCtrl:
      cs && cs() // eslint-disable-line
      break
    case ModifierState.Shift:
      s && s() // eslint-disable-line
      break
    case ModifierState.Ctrl:
      c && c() // eslint-disable-line
      break
    default:
      n && n() // eslint-disable-line
  }
}
