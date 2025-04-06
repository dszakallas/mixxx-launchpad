export const posMod = (x: number, n: number): number => ((x % n) + n) % n

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
