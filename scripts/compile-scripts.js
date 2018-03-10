#!/usr/bin/env node

var prify = require('es6-promisify')
var path = require('path')
var mkdirp = prify(require('mkdirp'))
var fs = require('fs')

var rollup = require('rollup')
var nodeResolve = require('rollup-plugin-node-resolve')
var babel = require('rollup-plugin-babel')
var commonjs = require('rollup-plugin-commonjs')
var json = require('rollup-plugin-json')
var writeFile = prify(fs.writeFile)
var readFile = prify(fs.readFile)

if (process.argv.length > 5 || (process.argv.length === 5 && process.argv[4] !== "watch")) {
  throw Error('Usage: target outFile [watch]')
}

var watch = process.argv.length === 5

var watcher = null

var tgt = process.argv[2]
var tgtPkg = require(path.resolve('packages', tgt, 'package.json'))
var entry = path.resolve('packages', tgt, tgtPkg.main)

var global = tgtPkg.controller.global

mkdirp(path.dirname(path.resolve(process.argv[3])))
  .then(() => readFile('tmp/cache.json'))
  .then((cache) => JSON.parse(cache))
  .catch((err) => null)
  .then((cache) => {
    return rollup.rollup({
      cache,
      entry,
      plugins: [
        nodeResolve({
          extensions: ['.js', '.json'],
          main: true,
          modulesOnly: false, // required for rollup-plugin-commonjs
          // for valid values see https://github.com/substack/node-resolve
          customResolveOptions: {
            paths: [ path.resolve('packages', tgt, 'node_modules') ]
          }}),
        json(),
        babel({
          exclude: 'node_modules/**'}),
        commonjs()]})
  })
  .then((bundle) => {
    const cache = JSON.stringify(bundle)
    return mkdirp('tmp')
      .then(() => writeFile('tmp/cache.json', cache))
      .then(() => bundle.write({
        format: 'iife',
        moduleName: global,
        dest: path.resolve(process.argv[3])
      }))
  })
  .catch(function (err) {
    console.error(err)
    process.exit(1)
  })

process.on('SIGINT', () => {
  if (watcher) {
    watcher.close()
    watcher = null
  }
  process.exit(125)
})
