#!/usr/bin/env node

var ejs = require('ejs')
var path = require('path')
var readFile = require('fs').readFile
var writeFile = require('fs').writeFile

if (process.argv.length !== 6) {
  throw Error('Usage: buttons package template outDir')
}

var buttons = require(path.resolve(process.argv[2])).buttons
var pkg = require(path.resolve(process.argv[3]))

readFile(process.argv[4], function (err, template) {
  if (err) throw err
  var rendered = ejs.render(template.toString(), {
    name: pkg.name,
    author: pkg.author,
    description: pkg.description,
    homepage: pkg.homepage,
    id: pkg.mixxx.id,
    moduleName: pkg.mixxx.moduleName,
    callbackPrefix: pkg.mixxx.callbackPrefix,
    buttons: Object.keys(buttons).map((key) => buttons[key])
  })
  writeFile(path.resolve(process.argv[5], pkg.mixxx.id + '.midi.xml'), rendered, function (err) {
    if (err) {
      throw err
    }
  })
})
