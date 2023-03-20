#!/usr/bin/env node

import ejs from 'ejs'
import { resolve, dirname, join } from 'path'
import {readFile, writeFile} from 'node:fs/promises'
import mkdirp from 'mkdirp'

if (process.argv.length !== 4) {
  throw Error('Usage: target outFile')
}

const [tgt, outFile] = process.argv.slice(-2)
const [pkg, controller] = await Promise.all([
  readFile(resolve('packages', tgt, 'package.json')).then(JSON.parse),
  readFile(resolve('packages', tgt, 'controller.json')).then(JSON.parse)
])

const templateFile = join('scripts', 'template.xml.ejs')
const hexFormat = (n, d) => '0x' + n.toString(16).toUpperCase().padStart(d, '0')

const template = await readFile(templateFile)
const rendered = ejs.render(template.toString(), {
  author: pkg.author,
  description: pkg.description,
  homepage: pkg.homepage,
  device: controller.device,
  manufacturer: controller.manufacturer,
  global: controller.global,
  buttons: Object.values(controller.controls),
  hexFormat: hexFormat
})
await mkdirp(dirname(resolve(outFile)))
await writeFile(resolve(outFile), rendered)

