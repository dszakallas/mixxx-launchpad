import { array, map, range } from '@mixxx-launch/common'
import { MidiMessage } from '@mixxx-launch/common/midi'
import { Component, Container } from '@mixxx-launch/common/component'
import { sendShortMsg } from '@mixxx-launch/mixxx'

import {
  ControlComponent,
  EffectDef,
  EffectParameterDef,
  getValue,
  root,
  setValue,
} from '@mixxx-launch/mixxx/src/Control'
import { absoluteLin } from '@mixxx-launch/mixxx/src/util'
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

  onMount() {
    super.onMount()
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
  }

  onUnmount() {
    super.onUnmount()
    this._prevEffectUnit.removeAllListeners()
    this._nextEffectUnit.removeAllListeners()
  }
}

const toEffectKnobRange = (value: number) => {
  return absoluteLin(value, 0, 1)
}

const toEffectButtonRange = (value: number) => {
  return Number(value - 64 > 0)
}

class FxComponent extends Container {
  effectDef: EffectDef

  private _loadedComponent: ControlComponent
  private _enabledComponent: ControlComponent
  private _midiComponents: MidiComponent[]

  private _device: LaunchControlDevice
  private _params: EffectParameterDef[]
  private _buttonParams: EffectParameterDef[]

  constructor(device: LaunchControlDevice, template: number, row: number, effectDef: EffectDef) {
    const loaded = new ControlComponent(effectDef.loaded)
    const enabled = new ControlComponent(effectDef.enabled)
    const midiComponents = []
    for (const i of range(8)) {
      const midiComponent = new MidiComponent(device, template, `knob.${row}.${7 - i}`)
      midiComponents.push(midiComponent)
    }

    super([loaded, enabled, ...midiComponents])
    this.effectDef = effectDef
    this._device = device
    this._params = []
    this._buttonParams = []

    this._loadedComponent = loaded
    this._enabledComponent = enabled
    this._midiComponents = midiComponents
  }

  onChange() {
    const numParams = getValue(this.effectDef.num_parameters)
    const numButtonParams = getValue(this.effectDef.num_button_parameters)
    this._params = array(map((i) => this.effectDef.parameters[i], range(numParams)))
    this._buttonParams = array(map((i) => this.effectDef.parameters[i], range(numButtonParams)))

    for (const i of range(8)) {
      const ledName = this._midiComponents[i].control.name.replace('knob', 'led')
      const ledControl = this._device.controls[ledName]
      if (i < this._params.length) {
        sendShortMsg(ledControl, this._device.colors.lo_green)
      } else if (i < this._params.length + this._buttonParams.length) {
        sendShortMsg(ledControl, this._device.colors.lo_red)
      } else {
        sendShortMsg(ledControl, this._device.colors.black)
      }
    }
  }

  onMount() {
    this._loadedComponent.addListener('update', this.onChange.bind(this))
    this._enabledComponent.addListener('update', this.onChange.bind(this))
    for (let i = 0; i < this._midiComponents.length; i++) {
      const midiComponent = this._midiComponents[i]
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        if (i < this._params.length) {
          setValue(this._params[this._params.length - i - 1].value, toEffectKnobRange(value))
        } else if (i < this._params.length + this._buttonParams.length) {
          setValue(
            this._buttonParams[this._buttonParams.length - (i - this._params.length) - 1].button_value,
            toEffectButtonRange(value),
          )
        }
      })
    }
    super.onMount()
  }

  onUnmount() {
    super.onUnmount()
    for (const midiComponent of this._midiComponents) {
      midiComponent.removeAllListeners()
    }
    this._loadedComponent.removeAllListeners()
    this._enabledComponent.removeAllListeners()
  }
}
