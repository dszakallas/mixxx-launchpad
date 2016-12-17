#!/usr/bin/env node

var path = require('path')
var browserify = require('browserify')
var through = require('through2')

if (process.argv.length !== 4) {
  throw Error('Usage: package index')
}

var pkg = require(path.resolve(process.argv[2]))

var moduleName = pkg.mixxx.moduleName

var bundler = browserify(path.resolve(process.argv[3]), {
  transform: 'babelify',
  standalone: moduleName
})

bundler.pipeline.get('deps').push(through.obj(function (row, enc, next) {
  process.stdout.write(row.id + ' ')
  next()
}))

bundler.bundle()
