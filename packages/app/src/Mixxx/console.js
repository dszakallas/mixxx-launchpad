import { engine } from './globals'
import { startsWith } from 'lodash-es'

import stringify from 'json-stringify-safe'

function assemble () {
  let str = ''
  let first = true
  Array.prototype.slice.call(arguments).forEach((arg) => {
    let appendend
    if (Array.isArray(arg)) {
      appendend = `[${arg.toString()}]`
    } else if (typeof arg === 'object' && startsWith(arg.toString(), '[object')) {
      appendend = stringify(arg, null, 2)
    } else {
      appendend = arg
    }
    if (first) {
      str = appendend
      first = false
    } else {
      str = `${str} ${appendend}`
    }
  })
  return str
}
export const console = {
  log () {
    engine.log(assemble.apply(this, arguments))
  },
  error () {
    engine.log(assemble.apply(this, arguments))
  }
}
