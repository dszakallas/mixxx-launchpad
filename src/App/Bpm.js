import { EventEmitter } from 'events'

export class Bpm extends EventEmitter {
  constructor (max) {
    super()
    this.tapTime = 0
    this.taps = []
    this.max = max || 8
  }
  reset () {
    this.taps = []
    this.tapDelta = 0
  }
  tap () {
    const now = Date.now()
    const tapDelta = now - this.tapTime
    this.tapTime = now
    if (tapDelta > 2000) { // reset if longer than two seconds between taps
      this.taps = []
    } else {
      this.taps.push(60000 / tapDelta)
      if (this.taps.length > this.max) this.taps.shift() // Keep the last n samples for averaging
      let sum = 0
      this.taps.forEach((v) => { sum += v })
      const avg = sum / this.taps.length
      this.emit('tap', avg)
    }
  }
}
