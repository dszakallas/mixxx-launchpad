import {
  Component,
} from '@mixxx-launch/mixxx'

export type BindingTemplate < Ctx > = {
  type: (ctx: Ctx) => Component,
  listeners?: {
    [_: string]: (control: any) => (...args: any[]) => void
  }  
}

export type KeyType = string | number | symbol

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Phantom<_Ctx> = never

export type ControlType < Ctx > = {
  type: string
  bindings: { [_: KeyType]: BindingTemplate < Ctx > }
  params: Params
  state?: State
  context?: Phantom<Ctx>
}

export type State = { [_: KeyType]: unknown }
export type Params = { [_: KeyType]: unknown }

export type ControlTemplate<Ctx, C extends ControlType<Ctx>> = {
  bindings: C['bindings']
  state?: C['state']
}

export type MakeControlTemplate<Ctx, C extends ControlType<Ctx>> = (
  params: C['params']
) => ControlTemplate<Ctx, C>

export type Bindings<Ctx, C extends ControlType<Ctx>> = {
  [K in keyof C["bindings"]]: ReturnType<C["bindings"][K]["type"]>
}

export class Control<Ctx, C extends ControlType<Ctx>> extends Component {
  templates: C['bindings']
  bindings: Bindings<Ctx, C>
  state: C['state']
  context: Ctx

  constructor(templates: C['bindings'], state: C['state'], context: Ctx) {
    super()
    const bindings: { [_: string]: unknown } = {}
    for (const k in templates) {
      bindings[k] = templates[k].type(context)
    }
    this.bindings = bindings as Bindings<Ctx, C>
    this.templates = templates
    this.state = state

    this.context = context
  }

  onMount() {
    super.onMount()

    Object.keys(this.bindings).forEach((k) => {
      const b = this.bindings[k]
      const listeners = this.templates[k].listeners ?? {}
      Object.keys(listeners).forEach((event) => {
        const listener = listeners[event]
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
