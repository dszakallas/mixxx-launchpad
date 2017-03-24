#!/usr/bin/env node

var path = require('path')
var browserify = require('browserify')
var through = require('through2')

if (process.argv.length !== 3) {
  throw Error('Usage: target')
}

var tgt = process.argv[2]
var tgtPkg = require(path.resolve('packages', tgt, 'package.json'))
var entry = path.resolve('packages', tgt, tgtPkg.main)

var global = tgtPkg.controller.global

var bundler = browserify(entry, {
  transform: 'babelify',
  standalone: global,
  paths: [ path.resolve('packages', tgt, 'node_modules') ]
})

bundler.pipeline.get('deps').push(through.obj(function (row, enc, next) {
  process.stdout.write(row.id + ' ')
  next()
}))

bundler.bundle()
