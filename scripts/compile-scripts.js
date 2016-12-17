#!/usr/bin/env node

var path = require('path')
var browserify = require('browserify')
var createWriteStream = require('fs').createWriteStream

if (process.argv.length !== 5) {
  throw Error('Usage: package index outDir')
}

var pkg = require(path.resolve(process.argv[2]))

var moduleName = pkg.mixxx.moduleName
var id = pkg.mixxx.id

var output = createWriteStream(path.resolve(process.argv[4], id + '.js'))

browserify(path.resolve(process.argv[3]), {
  transform: 'babelify',
  standalone: moduleName
}).bundle().pipe(output)
