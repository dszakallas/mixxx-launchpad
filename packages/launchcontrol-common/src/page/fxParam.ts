import { array, map, range, absoluteLin } from '@mixxx-launch/common'
import { MidiMessage } from '@mixxx-launch/common/midi'
import { Component, Container } from '@mixxx-launch/common/component'
import { sendShortMsg } from '@mixxx-launch/mixxx'

import { ControlComponent, EffectDef, getValue, root, setParameter } from '@mixxx-launch/mixxx/src/Control'
import { LaunchControlDevice, MidiComponent } from '../device'

export const makeFxParamPage = (_conf: FxParamPageConf, template: number, device: LaunchControlDevice) =>
  new FxParamPage(device, template)

export type FxParamPageConf = {
  type: 'fxParamPage'
}

export class FxParamPage extends Container {
  private _device: LaunchControlDevice
  private _template: number
  private _fxs: Component[]
  private _nextEffectUnit: MidiComponent
  private _prevEffectUnit: MidiComponent
  private _selectedEffectUnit: number

  constructor(device: LaunchControlDevice, template: number) {
    const fxs = []
    const selectedEffectUnit = 0
    const prevEffectUnit = new MidiComponent(device, template, 'up')
    const nextEffectUnit = new MidiComponent(device, template, 'down')

    const unit = 0

    for (const i of range(3)) {
      const component = new FxComponent(device, template, i, root.effectRacks[0].effect_units[unit].effects[i])
      fxs.push(component)
    }
    super([prevEffectUnit, nextEffectUnit, ...fxs])
    this._selectedEffectUnit = selectedEffectUnit
    this._device = device
    this._template = template
    this._fxs = fxs
    this._prevEffectUnit = prevEffectUnit
    this._nextEffectUnit = nextEffectUnit
  }

  private changeEffectUnit() {
    for (const i of range(3)) {
      this._fxs[i].unmount()
      this._fxs[i] = new FxComponent(
        this._device,
        this._template,
        i,
        root.effectRacks[0].effect_units[this._selectedEffectUnit].effects[i],
      )
      this._fxs[i].mount()
    }
  }

  private drawPrevLed() {
    if (this._selectedEffectUnit > 0) {
      sendShortMsg(this._device.controls[`${this._template}.up`], this._device.colors.hi_red)
    } else {
      sendShortMsg(this._device.controls[`${this._template}.up`], this._device.colors.black)
    }
  }

  private drawNextLed() {
    if (this._selectedEffectUnit < 3) {
      sendShortMsg(this._device.controls[`${this._template}.down`], this._device.colors.hi_red)
    } else {
      sendShortMsg(this._device.controls[`${this._template}.down`], this._device.colors.black)
    }
  }

  override onMount() {
    this._prevEffectUnit.addListener('mount', this.drawPrevLed.bind(this))
    this._prevEffectUnit.addListener('midi', ({ value }: MidiMessage) => {
      if (value) {
        if (this._selectedEffectUnit > 0) {
          this._selectedEffectUnit -= 1
          this.drawPrevLed()
          this.drawNextLed()
          this.changeEffectUnit()
        }
      }
    })

    this._nextEffectUnit.addListener('mount', this.drawNextLed.bind(this))
    this._nextEffectUnit.addListener('midi', ({ value }: MidiMessage) => {
      if (value) {
        if (this._selectedEffectUnit < 3) {
          this._selectedEffectUnit += 1
          this.drawPrevLed()
          this.drawNextLed()
          this.changeEffectUnit()
        }
      }
    })
    super.onMount()
  }

  override onUnmount() {
    super.onUnmount()
    this._prevEffectUnit.removeAllListeners()
    this._nextEffectUnit.removeAllListeners()
  }
}

const toNormalized = (value: number) => {
  return absoluteLin(value, 0, 1)
}

const toBinary = (value: number) => {
  return Number(value - 64 > 0)
}

class FxComponent extends Container {
  effectDef: EffectDef

  private _loadedComponent: ControlComponent
  private _enabledComponent: ControlComponent
  private _midiComponents: MidiComponent[]

  private _device: LaunchControlDevice
  private _paramControls: ControlComponent[]
  private _buttonParamControls: ControlComponent[]

  constructor(device: LaunchControlDevice, template: number, row: number, effectDef: EffectDef) {
    const loaded = new ControlComponent(effectDef.loaded)
    const enabled = new ControlComponent(effectDef.enabled)
    const numParams = getValue(effectDef.num_parameters)
    const numButtonParams = getValue(effectDef.num_button_parameters)
    const paramControls = array(
      map((i) => new ControlComponent(effectDef.parameters[i].value, true, true), range(numParams)),
    )
    const buttonParamControls = array(
      map((i) => new ControlComponent(effectDef.parameters[i].button_value, true, true), range(numButtonParams)),
    )
    const midiComponents = []
    for (const i of range(8)) {
      const midiComponent = new MidiComponent(device, template, `knob.${row}.${7 - i}`)
      midiComponents.push(midiComponent)
    }

    super([loaded, enabled, ...midiComponents, ...paramControls, ...buttonParamControls])
    this.effectDef = effectDef
    this._device = device
    this._paramControls = paramControls
    this._buttonParamControls = buttonParamControls

    this._loadedComponent = loaded
    this._enabledComponent = enabled
    this._midiComponents = midiComponents
  }

  onChange() {
    for (const i of range(8)) {
      const ledName = this._midiComponents[i].control.name.replace('knob', 'led')
      const ledControl = this._device.controls[ledName]
      if (i < this._paramControls.length) {
        sendShortMsg(ledControl, this._device.colors.lo_green)
      } else if (i < this._paramControls.length + this._buttonParamControls.length) {
        sendShortMsg(ledControl, this._device.colors.lo_red)
      } else {
        sendShortMsg(ledControl, this._device.colors.black)
      }
    }
  }

  override onMount() {
    this._loadedComponent.addListener('update', this.onChange.bind(this))
    this._enabledComponent.addListener('update', this.onChange.bind(this))
    for (let i = 0; i < this._midiComponents.length; i++) {
      const midiComponent = this._midiComponents[i]
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        if (i < this._paramControls.length) {
          setParameter(this._paramControls[this._paramControls.length - i - 1].control, toNormalized(value))
        } else if (i < this._paramControls.length + this._buttonParamControls.length) {
          setParameter(
            this._buttonParamControls[this._buttonParamControls.length - (i - this._paramControls.length) - 1].control,
            toBinary(value),
          )
        }
      })
    }
    super.onMount()
  }

  override onUnmount() {
    super.onUnmount()
    for (const midiComponent of this._midiComponents) {
      midiComponent.removeAllListeners()
    }
    this._loadedComponent.removeAllListeners()
    this._enabledComponent.removeAllListeners()
  }
}
