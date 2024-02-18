import { access, readFile } from 'node:fs/promises'
import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
import { resolve } from 'node:path'

export const exists = (f: string) =>
  access(f)
    .then(() => true)
    .catch(() => false)

export const exec = promisify(_exec)

export const gitSHA = async () => {
  const { stdout } = await exec('git rev-parse HEAD')
  return stdout.trim()
}

export const gitTagAlwaysDirty = async () => {
  const { stdout } = await exec('git describe --tags --always --dirty')
  return stdout.trim()
}

export const getControls = async (tgt: string) => {
  const deviceTs = resolve('packages', tgt, 'controls.ts')
  if (await exists(deviceTs)) {
    const mod = await import(deviceTs)
    return mod.default()
  }
  throw Error(`Missing control definitions for ${tgt} (no such file: ${deviceTs})`)
}

export const getPackage = (tgt: string) =>
  readFile(resolve('packages', tgt, 'package.json')).then((f) => JSON.parse(f.toString()))

export const getDevice = (tgt: string) => readFile('devices.json').then((f) => JSON.parse(f.toString())[tgt])
