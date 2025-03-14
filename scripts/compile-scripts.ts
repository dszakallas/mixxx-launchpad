#!/usr/bin/env bun

import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname, basename } from 'node:path'

import { mkdirp } from 'mkdirp'

import { rollup } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

import { gitSHA, gitTagAlwaysDirty, getPackage, getDevice } from './util'

if (process.argv.length !== 4) {
  throw Error('Usage: target outFile')
}

const [tgt, outFile] = process.argv.slice(-2)

const getBundleHeader = async () => `/* eslint-disable */
/*
 * ${basename(outFile)}
 *
 * This file is generated. Do not edit directly.
 * Instead, edit the source file and regenerate it.
 * See https://github.com/dszakallas/mixxx-launchpad#building-from-source.
 *
 * Commit tag: ${await gitTagAlwaysDirty()}
 * Commit hash: ${await gitSHA()}
 */`

const tmp = 'tmp'

const [device, tgtPkg, cache] = await Promise.all([
  getDevice(tgt),
  getPackage(tgt),
  readFile(`${tmp}/${tgt}.cache.json`).then(
    (cache) => JSON.parse(cache.toString()),
    (_err) => null,
  ),
  mkdirp(dirname(resolve(outFile))),
])

const input = resolve('packages', tgt, tgtPkg.main)
const global = device.global

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
      exclude: ['node_modules/@babel/runtime/**'],
      extensions: ['.ts', '.js'],
      include: resolve('packages', '**', '*.ts'),
      configFile: resolve('babel.config.js'),
      babelHelpers: 'runtime',
    }),
  ],
})
await mkdirp(tmp)
await Promise.all([
  writeFile(`${tmp}/${tgt}.cache.json`, JSON.stringify(bundle.cache)),
  bundle.write({
    //strict: false, // FIXME: see https://github.com/mixxxdj/mixxx/pull/1795#discussion_r251744258
    format: 'iife',
    name: global,
    file: resolve(outFile),
    banner: await getBundleHeader(),
  }),
])
