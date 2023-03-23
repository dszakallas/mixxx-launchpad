export const posMod = (x: number, n: number): number => ((x % n) + n) % n

export const range = (n: number) => [...Array(n).keys()]
