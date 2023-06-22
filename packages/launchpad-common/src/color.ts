export type RGBColor = [number, number, number]

export const parseRGBColor = (number: number): RGBColor | null => {
  if (number === -1) {
    return null
  }
  const blue = number % 256
  const green = (number >> 8) % 256
  const red = (number >> 16) % 256
  return [red, green, blue]
}
