export type RGBColor = [number, number, number]

export const parseRGBColor = (number: number): RGBColor => {
  const blue = number % 256
  const green = (number >> 8) % 256
  const red = (number >> 16) % 256
  return [red, green, blue]
}
