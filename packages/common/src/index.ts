export const posMod = (x: number, n: number): number => ((x % n) + n) % n

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

export const hexFormat = (n: number, d: number) => n.toString(16).toUpperCase().padStart(d, '0')

export const range = function* (n: number): Generator<number> {
  for (let i = 0; i < n; i++) {
    yield i
  }
}

export const array = <T>(n: Generator<T>): T[] => [...n]

export const map = function* <T, U>(f: (x: T) => U, n: Generator<T>): Generator<U> {
  for (const x of n) {
    yield f(x)
  }
}

export * from './Lazy'
export { default as Bpm } from './Bpm'
