#!/usr/bin/env node

import ejs from 'ejs'
import path from 'path'
import {readFile, writeFile} from 'node:fs/promises'
import mkdirp from 'mkdirp'

if (process.argv.length !== 4) {
  throw Error('Usage: target outFile')
}

const tgt = process.argv[2]
const pkg = JSON.parse(await readFile(path.resolve('packages', tgt, 'package.json')))
const controller = JSON.parse(await readFile(path.resolve('packages', tgt, 'controller.json')))
const templateFile = path.join('scripts', 'template.xml.ejs')

const leftPad = (str, padString, length) => {
  let buf = str
  while (buf.length < length) {
    buf = padString + buf
  }
  return buf
}

const hexFormat = (n, d) => '0x' + leftPad(n.toString(16).toUpperCase(), '0', d)

const template = await readFile(templateFile)
const rendered = ejs.render(template.toString(), {
  author: pkg.author,
  description: pkg.description,
  homepage: pkg.homepage,
  device: controller.device,
  manufacturer: controller.manufacturer,
  global: controller.global,
  buttons: Object.keys(controller.controls).map((key) => controller.controls[key]),
  hexFormat: hexFormat
})
await mkdirp(path.dirname(path.resolve(process.argv[3])))
await writeFile(path.resolve(process.argv[3]), rendered)

