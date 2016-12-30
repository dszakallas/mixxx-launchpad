import { engine } from './globals'

const stringify = require('json-stringify-safe')
const moduleName = require('../../package.json').mixxx.moduleName

function assemble () {
  let str = `[${moduleName}]`
  Array.prototype.slice.call(arguments).forEach((arg) => {
    let appendend
    if (typeof arg.toString === 'function') {
      appendend = arg.toString()
      if (arg.toString().startsWith('[object')) {
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
