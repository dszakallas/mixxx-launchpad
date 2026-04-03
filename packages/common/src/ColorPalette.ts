import { RGBColor } from './Color'

/**
 * ColorPalette provides a 2D indexable color palette.
 * - X axis (valence): different perceptually distinct colors
 * - Y axis (brightness): brightness levels (0 = dim, 1 = bright, etc.)
 *
 * Indexing out of bounds will wrap around (modulo).
 */
export interface ColorPalette {
  /**
   * Get a color from the palette.
   * @param valence - Color index (wraps around if out of bounds)
   * @param brightness - Brightness level (wraps around if out of bounds)
   */
  getColor(valence: number, brightness: number): PaletteColor

  /**
   * Number of distinct colors (valence axis)
   */
  readonly numColors: number

  /**
   * Number of brightness levels
   */
  readonly numBrightness: number
}

/**
 * A color that can be either an indexed Color enum value or an RGB color
 */
export type PaletteColor =
  | {
      type: 'indexed'
      color: number
    }
  | {
      type: 'rgb'
      color: RGBColor
    }

/**
 * IndexedColorPalette uses the Color enum values from the device.
 * Designed for non-RGB devices like MK1.
 */
export class IndexedColorPalette implements ColorPalette {
  private colors: number[][]
  readonly numColors: number
  readonly numBrightness: number

  /**
   * @param colors - 2D array where colors[valence][brightness] gives the Color enum value
   */
  constructor(colors: number[][]) {
    if (colors.length === 0 || colors[0].length === 0) {
      throw new Error('ColorPalette must have at least one color and one brightness level')
    }
    this.colors = colors
    this.numColors = colors.length
    this.numBrightness = colors[0].length
  }

  getColor(valence: number, brightness: number): PaletteColor {
    const v = ((valence % this.numColors) + this.numColors) % this.numColors
    const b = ((brightness % this.numBrightness) + this.numBrightness) % this.numBrightness
    return {
      type: 'indexed',
      color: this.colors[v][b],
    }
  }
}

/**
 * RGBColorPalette uses RGB colors for devices that support them.
 * Provides a much wider range of colors.
 */
export class RGBColorPalette implements ColorPalette {
  private colors: RGBColor[][]
  readonly numColors: number
  readonly numBrightness: number

  /**
   * @param colors - 2D array where colors[valence][brightness] gives the RGB color
   */
  constructor(colors: RGBColor[][]) {
    if (colors.length === 0 || colors[0].length === 0) {
      throw new Error('ColorPalette must have at least one color and one brightness level')
    }
    this.colors = colors
    this.numColors = colors.length
    this.numBrightness = colors[0].length
  }

  getColor(valence: number, brightness: number): PaletteColor {
    const v = ((valence % this.numColors) + this.numColors) % this.numColors
    const b = ((brightness % this.numBrightness) + this.numBrightness) % this.numBrightness
    return {
      type: 'rgb',
      color: this.colors[v][b],
    }
  }

  /**
   * Create a palette with perceptually distinct RGB colors.
   * Uses HSV color space to generate evenly distributed hues with multiple brightness levels.
   * Colors are ordered to maximize perceptual difference between adjacent colors.
   */
  static createRGBPalette(): RGBColorPalette {
    const numHues = 12 // 12 distinct hues around the color wheel
    const brightnessLevels = 2 // dim, bright

    // Reorder hues to maximize perceptual difference between adjacent colors
    // Instead of sequential (0, 1, 2, 3...), use a pattern that jumps around the color wheel
    // This creates: Red, Cyan, Yellow, Blue, Green, Magenta, Orange, Sky, Lime, Purple, etc.
    const hueOrder = [0, 6, 2, 8, 4, 10, 1, 7, 3, 9, 5, 11]

    const colors: RGBColor[][] = []

    for (let i = 0; i < numHues; i++) {
      const hue = (hueOrder[i] * 360) / numHues
      const hueColors: RGBColor[] = []

      for (let b = 0; b < brightnessLevels; b++) {
        const value = 0.2 + b * 0.8
        const saturation = 1.0

        hueColors.push(hsvToRgb(hue, saturation, value))
      }

      colors.push(hueColors)
    }

    return new RGBColorPalette(colors)
  }
}

/**
 * Convert HSV to RGB color space
 * @param h - Hue (0-360)
 * @param s - Saturation (0-1)
 * @param v - Value/Brightness (0-1)
 * @returns RGB color as [r, g, b] where each component is 0-255
 */
function hsvToRgb(h: number, s: number, v: number): RGBColor {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}
