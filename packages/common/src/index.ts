export const posMod = (x: number, n: number): number => ((x % n) + n) % n

export const hexFormat = (n: number, d: number) => '0x' + n.toString(16).toUpperCase().padStart(d, '0')

export const range = function * (n: number): Generator<number> {
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

export const forEach = <T>(f: (x: T) => void, n: Generator<T>): void => {
  for (const x of n) {
    f(x)
  }
}

export const zip = function* <T, U>(n1: Generator<T>, n2: Generator<U>): Generator<[T, U]> {
  const i1 = n1[Symbol.iterator]()
  const i2 = n2[Symbol.iterator]()
  while (true) {
    const r1 = i1.next()
    const r2 = i2.next()
    if (r1.done || r2.done) {
      break
    }
    yield [r1.value, r2.value]
  }
}

export const chain = function* <T>(...ns: (Generator<T> | Iterable<T>)[]): Generator<T> {
  for (const n of ns) {
    for (const x of n) {
      yield x
    }
  }
}
