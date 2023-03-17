#!/usr/bin/env node

import path from 'path'
import mkdirp from 'mkdirp'

import { rollup } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'
import { readFile, writeFile } from 'node:fs/promises'

if (process.argv.length !== 4) {
  throw Error('Usage: target outFile')
}

const tgt = process.argv[2]
const tgtPkg = JSON.parse(await readFile(path.resolve('packages', tgt, 'package.json')))
const controller = JSON.parse(await readFile(path.resolve('packages', tgt, 'controller.json')))
const input = path.resolve('packages', tgt, tgtPkg.main)

const global = controller.global

await mkdirp(path.dirname(path.resolve(process.argv[3])))
const cache = await readFile(`tmp/${tgt}.cache.json`).then((cache) => JSON.parse(cache), (_err) => null)
const bundle = await rollup({
  cache,
  input,
  treeshake: 'smallest',
  strictDeprecations: true,
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.js', '.json'],
    }),
    json(),
    commonjs(),
    babel({
      exclude: [
        'node_modules/@babel/runtime/**'
      ],
      extensions: ['.ts', '.js'],
      include: path.resolve("packages", "**", "*.ts"),
      configFile: path.resolve('babel.config.js'),
      babelHelpers: 'runtime'
    }),
    terser()
  ]
})
await mkdirp('tmp')
await Promise.all([
  writeFile(`tmp/${tgt}.cache.json`, JSON.stringify(bundle.cache)),
  bundle.write({
    strict: false, // FIXME: see https://github.com/mixxxdj/mixxx/pull/1795#discussion_r251744258
    format: 'iife',
    name: global,
    file: path.resolve(process.argv[3])
  })])
