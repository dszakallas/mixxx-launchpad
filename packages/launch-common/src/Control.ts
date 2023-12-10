import {
  Component,
} from '@mixxx-launch/mixxx'

export type BindingTemplate = {
  type: new (...args: any[]) => Component,
  target: any,
  listeners: {
    [_: string]: (control: any) => any
  }  
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Phantom<_Ctx> = never

export type ControlType < Ctx > = {
  type: string
  bindings: { [k: string | number | symbol]: BindingTemplate }
  params: Params
  state: State
  context?: Phantom<Ctx>
}

export type State = { [k: string]: any }
export type Params = { [k: string]: any }

export type ControlTemplate<C extends ControlType<any>> = {
  bindings: C['bindings']
  state: C['state']
}

export type MakeControlTemplate<C extends ControlType<any>> = (
  params: C['params']
) => ControlTemplate<C>

export type MakeBindings<Ctx, C extends ControlType<Ctx>> = (ctx: Ctx, template: C["bindings"]) => Bindings<C>

export type Bindings<C extends ControlType<any>> = {
  [K in keyof C["bindings"]]: InstanceType<C["bindings"][K]["type"]>
}

export type IControl<Ctx, C extends ControlType<Ctx>> = {
  bindings: Bindings<C>
  state: C['state']
  context: Ctx
}

export class Control<Ctx, C extends ControlType<Ctx>> extends Component implements IControl<Ctx, C> {
  templates: C['bindings']
  bindings: Bindings<C>
  state: C['state']
  context: Ctx

  constructor(makeBindings: MakeBindings<Ctx, C>, templates: C['bindings'], state: C['state'], context: Ctx) {
    super()
    this.bindings = makeBindings(context, templates)
    this.templates = templates
    this.state = state

    this.context = context
  }

  onMount() {
    super.onMount()

    Object.keys(this.bindings).forEach((k) => {
      const b = this.bindings[k]
      Object.keys(this.templates[k].listeners).forEach((event) => {
        const listener = this.templates[k].listeners[event]
        if (listener != null) {
          b.addListener(event, listener(this))
        }
      }) 
    })

    Object.values(this.bindings).forEach((b) => b.mount())
  }

  onUnmount() {
    const bs = Object.values(this.bindings)
    bs.forEach((b) => b.unmount())
    bs.forEach((b) => b.removeAllListeners())
    super.onUnmount()
  }
}
