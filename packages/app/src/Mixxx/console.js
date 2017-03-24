import { engine } from './globals'
import startsWith from 'lodash.startswith'

const stringify = require('json-stringify-safe')

function assemble () {
  let str = ''
  Array.prototype.slice.call(arguments).forEach((arg) => {
    let appendend
    if (arg != null && typeof arg.toString === 'function') {
      appendend = arg.toString()
      if (startsWith(arg.toString(), '[object')) {
        appendend = stringify(arg, null, 2)
      }
    } else {
      appendend = arg
    }
    str = `${str} ${appendend}`
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
