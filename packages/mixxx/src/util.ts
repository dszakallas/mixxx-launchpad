export type Action<T> = (t: T) => void

export const absoluteNonLin = (
  value: number,
  low: number,
  mid: number,
  high: number,
  min: number = 0,
  max: number = 127,
) => {
  const center = (max - min) / 2
  if (value === center || value === Math.round(center)) {
    return mid
  } else if (value < center) {
    return low + value / (center / (mid - low))
  } else {
    return mid + (value - center) / (center / (high - mid))
  }
}

export const absoluteLin = (value: number, low: number, high: number, min: number = 0, max: number = 127) =>
  ((high - low) / (max - min)) * (value - min) + low
