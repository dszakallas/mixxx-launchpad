export type VerticalGroupParams = {
  template: number,
  columnOffset?: number,
  rowOffset?: number,
  numDecks: number,
}


export const channelColorPalette = [
  ['hi_red', 'lo_red'],
  ['hi_yellow', 'lo_yellow'],
  ['hi_green', 'lo_green'],
  ['hi_amber', 'lo_amber'],
] as const
