import EventEmitter from 'eventemitter3'

export class Bpm extends EventEmitter {
  tapTime: number
  taps: number[]
  max: number

  constructor(max: number = 8) {
    super()
    this.tapTime = 0
    this.taps = []
    this.max = max
  }

  reset() {
    this.taps = []
  }

  tap() {
    const now = Date.now()
    const tapDelta = now - this.tapTime
    this.tapTime = now
    if (tapDelta > 2000) {
      // reset if longer than two seconds between taps
      this.taps = []
    } else {
      this.taps.push(60000 / tapDelta)
      if (this.taps.length > this.max) this.taps.shift() // Keep the last n samples for averaging
      const sum = this.taps.reduce((acc, v) => acc + v, 0)
      const avg = sum / this.taps.length
      this.emit('tap', avg)
    }
  }
}
