import { RGBColor } from '@mixxx-launch/common/color'

export type Action<T> = (t: T) => void

export const parseRGBColor = (color: number): RGBColor | null => {
  if (color === -1) {
    return null
  }
  const blue = color & 0xff
  const green = (color >> 8) & 0xff
  const red = (color >> 16) & 0xff
  return [red, green, blue]
}
