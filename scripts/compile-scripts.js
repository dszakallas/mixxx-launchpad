#!/usr/bin/env node

const { promisify } = require('es6-promisify')
const path = require('path')
const mkdirp = promisify(require('mkdirp'))
const fs = require('fs')

const rollup = require('rollup')
const nodeResolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

if (process.argv.length !== 4) {
  throw Error('Usage: target outFile')
}

const tgt = process.argv[2]
const tgtPkg = require(path.resolve('packages', tgt, 'package.json'))
const input = path.resolve('packages', tgt, tgtPkg.main)

const global = tgtPkg.controller.global

mkdirp(path.dirname(path.resolve(process.argv[3])))
  .then(() => readFile('tmp/cache.json'))
  .then((cache) => JSON.parse(cache))
  .catch((err) => null)
  .then((cache) => {
    return rollup.rollup({
      cache,
      input,
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
        name: global,
        file: path.resolve(process.argv[3])
      }))
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
