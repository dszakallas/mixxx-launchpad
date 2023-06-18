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

export class Lazy<T> {
  private _fn: () => T
  private _cached: boolean
  private _value: T | undefined

  constructor(fn: () => T) {
    this._fn = fn
    this._cached = false
    this._value = undefined
  }

  get value() : T {
    if (!this._cached) {
      this._value = this._fn()
      this._cached = true
    }
    return this._value as T
  }
}

export const lazy = <T>(fn: () => T): Lazy<T> => new Lazy(fn)

export const isLazy = (x: any): x is Lazy<any> => x instanceof Lazy

export type LazyObject<T extends {[k: string]: any}> = {
  [Prop in keyof T]: Prop | Lazy<Prop>
}

export const lazyArray = <T>(lazies: (Lazy<T> | T)[]): T[] => new Proxy(lazies, {
  get: function (target: Lazy<T>[], prop: PropertyKey): any {
    if (typeof (prop) === 'string' &&
      (Number.isInteger(Number(prop))) &&
      // @ts-ignore
      isLazy(target[prop])
    ) {
      // key is an index
      // @ts-ignore
      return target[prop].value 
    } else {
      // @ts-ignore
      return target[prop] 
    }
  }
}) as T[]

export const lazyObject = <T extends { [k: string]: any }>(obj: LazyObject<T>): T => new Proxy(obj, {
  get(target: LazyObject<T>, prop: PropertyKey) {
    // @ts-ignore
    const value = target[prop]
    if (isLazy(value)) {
      return value.value
    }
    return value
  },
}) as T

