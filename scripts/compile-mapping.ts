#!/usr/bin/env bun

import { resolve, dirname, join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'

import ejs from 'ejs'
import { mkdirp } from 'mkdirp'

import { gitSHA, gitTagAlwaysDirty, getControls, getPackage, getDevice } from './util'

if (process.argv.length !== 4) {
  throw Error('Usage: target outFile')
}

const [tgt, outFile] = process.argv.slice(-2)
const [device, pkg, controls] = await Promise.all([getDevice(tgt), getPackage(tgt), getControls(tgt)])

const templateFile = join('scripts', 'template.xml.ejs')
const hexFormat = (n: number, d: number) => n.toString(16).toUpperCase().padStart(d, '0')

const template = await readFile(templateFile)
const { author, description, homepage } = pkg
const { device: deviceName, manufacturer, global } = device
const { controls: controlDefs, sysex } = controls

const rendered = ejs.render(template.toString(), {
  author,
  description,
  homepage,
  device: deviceName,
  manufacturer,
  global,
  buttons: Object.values(controlDefs),
  hexFormat,
  sysex,
  gitTag: await gitTagAlwaysDirty(),
  gitHash: await gitSHA(),
})
await mkdirp(dirname(resolve(outFile)))
await writeFile(resolve(outFile), rendered)
