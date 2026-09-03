import { Component } from '@mixxx-launch/common/component'

export type BindingTemplate<Ctx> = {
  type: (ctx: Ctx) => Component
  listeners?: {
    [_: string]: (control: any) => (...args: any[]) => void // eslint-disable-line
  }
}

export type KeyType = string | number | symbol

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Phantom<_Ctx> = never

export type ControlType<Ctx> = {
  type: string
  bindings: { [_: KeyType]: BindingTemplate<Ctx> }
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

export type MakeControlTemplate<Ctx, C extends ControlType<Ctx>> = (params: C['params']) => ControlTemplate<Ctx, C>

export type Bindings<Ctx, C extends ControlType<Ctx>> = {
  [K in keyof C['bindings']]: ReturnType<C['bindings'][K]['type']>
}

export class Control<Ctx, C extends ControlType<Ctx>> extends Component {
  bindings: Bindings<Ctx, C>

  constructor(
    public templates: C['bindings'],
    public state: C['state'],
    public context: Ctx,
  ) {
    super()
    const bindings: { [_: string]: unknown } = {}
    for (const [k, template] of Object.entries(templates)) {
      bindings[k] = template.type(context)
    }
    this.bindings = bindings as Bindings<Ctx, C>
  }

  override onMount() {
    super.onMount()

    for (const [k, b] of Object.entries(this.bindings)) {
      const listeners = this.templates[k].listeners ?? {}
      for (const [event, listener] of Object.entries(listeners)) {
        if (listener != null) {
          b.addListener(event, listener(this))
        }
      }
    }

    for (const b of Object.values(this.bindings)) {
      b.mount()
    }
  }

  override onUnmount() {
    for (const b of Object.values(this.bindings)) {
      b.unmount()
      b.removeAllListeners()
    }
    super.onUnmount()
  }
}
