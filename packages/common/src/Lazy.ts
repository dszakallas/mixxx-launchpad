export class Lazy<T> {
  private _fn: () => T
  private _cached: boolean
  private _value: T | undefined

  constructor(fn: () => T) {
    this._fn = fn
    this._cached = false
    this._value = undefined
  }

  get value(): T {
    if (!this._cached) {
      this._value = this._fn()
      this._cached = true
    }
    return this._value as T
  }
}

export const lazy = <T>(fn: () => T): Lazy<T> => new Lazy(fn)

export const isLazy = (x: unknown): x is Lazy<unknown> => x instanceof Lazy

export type LazyObject<T extends { [k: string]: unknown }> = {
  [Prop in keyof T]: Prop | Lazy<Prop>
}

export const lazyArray = <T>(lazies: (Lazy<T> | T)[]): T[] =>
  new Proxy(lazies, {
    get: function (target: Lazy<T>[], prop: PropertyKey): unknown {
      if (typeof prop === 'string' && Number.isInteger(Number(prop)) && isLazy(target[+prop])) {
        return target[+prop].value
      } else {
        return target[prop]
      }
    },
  }) as T[]

export const lazyObject = <T extends { [k: string]: unknown }>(obj: LazyObject<T>): T =>
  new Proxy(obj, {
    get(target: LazyObject<T>, prop: PropertyKey) {
      const value = target[prop]
      if (isLazy(value)) {
        return value.value
      }
      return value
    },
  }) as T
