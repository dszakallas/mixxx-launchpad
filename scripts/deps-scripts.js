#!/usr/bin/env node

var path = require('path')
var browserify = require('browserify')
var through = require('through2')

if (process.argv.length !== 3) {
  throw Error('Usage: target')
}

var pkg = require(path.resolve('package.json'))
var tgt = process.argv[2]
var entry = path.resolve('packages', tgt, 'app.js')

var moduleName = pkg.buildTargets[tgt].moduleName

var bundler = browserify(entry, {
  transform: 'babelify',
  standalone: moduleName,
  paths: [ path.resolve('packages', tgt, 'node_modules') ]
})

bundler.pipeline.get('deps').push(through.obj(function (row, enc, next) {
  process.stdout.write(row.id + ' ')
  next()
}))

bundler.bundle()
