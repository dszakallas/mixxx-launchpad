import { array, map, range } from "@mixxx-launch/common"
import { Component, MidiMessage, sendShortMsg } from "@mixxx-launch/mixxx"
import { ControlComponent, EffectDef, EffectParameterDef, getValue, root, setValue } from "@mixxx-launch/mixxx/src/Control"
import { LaunchControlDevice, LCMidiComponent } from "../device"

export const makeFxParamPage = (_conf: FxParamPageConf, template: number, device: LaunchControlDevice) => new FxParamPage(device, template)

export type FxParamPageConf = {
  type: 'fxParamPage'
}

export class FxParamPage extends Component {
  private _device: LaunchControlDevice
  private _template: number
  private _children: Component[]
  private _selectors: Component[]
  private _selectedEffectUnit: number

  constructor(device: LaunchControlDevice, template: number) {
    super()
    this._device = device
    this._template = template
    this._children = []
    this._selectors = []

    const prevEffectUnit = new LCMidiComponent(device, this._template, 'up')

    this._selectedEffectUnit = 0

    const drawPrevLed = () => {
      if (this._selectedEffectUnit > 0) {
        sendShortMsg(device.controls[`${this._template}.up`], device.colors.hi_red)
      } else {
        sendShortMsg(device.controls[`${this._template}.up`], device.colors.black)
      }
    }

    const drawNextLed = () => {
      if (this._selectedEffectUnit < 3) {
        sendShortMsg(device.controls[`${this._template}.down`], device.colors.hi_red)
      } else {
        sendShortMsg(device.controls[`${this._template}.down`], device.colors.black)
      }
    }

    prevEffectUnit.addListener('mount', () => {
      drawPrevLed()
    })

    prevEffectUnit.addListener('midi', ({ value }: MidiMessage) => {
      if (value) {
        if (this._selectedEffectUnit > 0) {
          this._selectedEffectUnit -= 1
          drawPrevLed()
          drawNextLed()
          this.changeEffectUnit()
        }
      }
    })

    this._selectors.push(prevEffectUnit)

    const nextEffectUnit = new LCMidiComponent(device, this._template, 'down')

    nextEffectUnit.addListener('mount', () => {
      drawNextLed()
    })

    nextEffectUnit.addListener('midi', ({ value }: MidiMessage) => {
      if (value) {
        if (this._selectedEffectUnit < 3) {
          this._selectedEffectUnit += 1
          drawPrevLed()
          drawNextLed()
          this.changeEffectUnit()
        }
      }
    })

    this._selectors.push(nextEffectUnit)

    const unit = 0

    for (const i of range(3)) {
      const component = new FxComponent(device, this._template, i, root.effectRacks[0].effect_units[unit].effects[i])
      this._children.push(component)
    }
  }

  changeEffectUnit() {
    for (const i of range(3)) {
      this._children[i].unmount()
      this._children[i] = new FxComponent(this._device, this._template, i, root.effectRacks[0].effect_units[this._selectedEffectUnit].effects[i])
      this._children[i].mount()
    }
  }

  onMount() {
    super.onMount()
    this._children.forEach((child) => child.mount())
    this._selectors.forEach((child) => child.mount())
  }

  onUnmount() {
    this._children.forEach((child) => child.unmount())
    this._selectors.forEach((child) => child.unmount())
    super.onUnmount()
  }
}

const toEffectKnobRange = (value: number) => {
  return value / 63.5 - 1
}

class FxComponent extends Component {
  effectDef: EffectDef

  private _loadedComponent: ControlComponent
  private _enabledComponent: ControlComponent
  private _midiComponents: LCMidiComponent[]

  private _device: LaunchControlDevice
  private _params: EffectParameterDef[]
  private _buttonParams: EffectParameterDef[]
 
  constructor(device: LaunchControlDevice, template: number, row: number, effectDef: EffectDef) { 
    super()
    this.effectDef = effectDef

    this._device = device
    this._params = []
    this._buttonParams = []

    this._loadedComponent = new ControlComponent(this.effectDef.loaded)
    this._loadedComponent.addListener('update', this.onChange.bind(this))

    this._enabledComponent = new ControlComponent(this.effectDef.enabled)
    this._enabledComponent.addListener('update', this.onChange.bind(this))

    this._midiComponents = []

    for (const i of range(8)) {
      const midiComponent = new LCMidiComponent(device, template, `knob.${row}.${7 - i}`) 
      midiComponent.addListener('midi', ({ value }: MidiMessage) => {
        if (i < this._params.length) {
          setValue(this._params[i].value, toEffectKnobRange(value))
        } else if (i < this._params.length + this._buttonParams.length) {
          setValue(this._buttonParams[i - this._params.length].button_value, Math.round(value - 127))
        }
      })
      this._midiComponents.push(midiComponent)
    }
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
    super.onMount()
    this._loadedComponent.mount()
    this._enabledComponent.mount()
    for (const midiComponent of this._midiComponents) {
      midiComponent.mount()
    }
  }

  onUnmount() {
    for (const midiComponent of this._midiComponents) {
      midiComponent.unmount()
    }
    this._enabledComponent.unmount()
    this._loadedComponent.unmount()
    super.onUnmount()
  }
}
