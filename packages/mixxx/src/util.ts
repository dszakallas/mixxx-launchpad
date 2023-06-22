export type Action<T> = (t: T) => void

/* -------- ------------------------------------------------------
            absoluteNonLin
   Purpose: Maps an absolute linear control value to a non-linear Mixxx control
            value (like EQs: 0..1..4)
   Input:   Control value (e.g. a knob,) MixxxControl values for the lowest,
            middle, and highest points, lowest knob value, highest knob value
            (Default knob values are standard MIDI 0..127)
   Output:  MixxxControl value corresponding to the knob position
   -------- ------------------------------------------------------ */
export const absoluteNonLin = (value: number, low: number, mid: number, high: number, min: number = 0, max: number = 127) => {
  const center = (max - min) / 2;
  if (value === center || value === Math.round(center)) {
    return mid;
  } else if (value < center) {
    return low + (value / (center / (mid - low)));
  } else {
    return mid + ((value - center) / (center / (high - mid)));
  }
}
