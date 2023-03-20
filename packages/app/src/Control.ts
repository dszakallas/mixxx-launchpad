import type { Modifier } from './ModifierSidebar';

import {
  ChannelControlDef,
  Component,
  ControlComponent,
  ControlDef,
  ControlMessage,
  MidiComponent,
  MidiMessage,
} from '@mixxx-launchpad/mixxx';
import { LaunchpadDevice } from '.';

import makeControlTemplateIndex, { ControlTypeIndex } from './controls'

export type ControlContext = {
  modifier: Modifier;
  device: LaunchpadDevice;
};

export type ControlType = {
  type: string;
  bindings: { [k: string]: Binding };
  params: Params;
  state: State;
};

export type ControlConf<C extends ControlType> = {
  type: C['type'];
  params?: C['params'];
};

export type ControlBindingTemplate<C extends ControlType> = {
  type: 'control';
  target: ControlDef;
  update?: (c: Control<C>) => (message: ControlMessage) => void;
  mount?: (c: Control<C>) => () => void;
  unmount?: (c: Control<C>) => () => void;
};

export type ButtonKey = [number, number];

export type ButtonBindingTemplate<C extends ControlType> = {
  type: 'button';
  target: ButtonKey;
  midi?: (c: Control<C>) => (message: MidiMessage) => void;
  attack?: (c: Control<C>) => (message: MidiMessage) => void;
  release?: (c: Control<C>) => (message: MidiMessage) => void;
  mount?: (c: Control<C>) => () => void;
  unmount?: (c: Control<C>) => () => void;
};

export type BindingTemplate<
  B extends Binding,
  C extends ControlType
> = B extends ControlComponent
  ? ControlBindingTemplate<C>
  : ButtonBindingTemplate<C>;

export type State = { [k: string]: any };
export type Params = { [k: string]: any };

export type ControlTemplate<C extends ControlType> = {
  bindings: {
    [Prop in keyof C['bindings']]: BindingTemplate<C['bindings'][Prop], C>;
  };
  state: C['state'];
};

export type MakeControlTemplate<C extends ControlType> = (
  params: C['params'],
  gridPosition: [number, number],
  deck: ChannelControlDef
) => ControlTemplate<C>;

export type Binding = ControlComponent | MidiComponent;

export type IControl<C extends ControlType> = {
  bindings: C['bindings'];
  state: C['state'];
  context: ControlContext;
};

const controlListeners = ['update', 'mount', 'unmount'] as const;

const midiListeners = [
  'attack',
  'release',
  'midi',
  'mount',
  'unmount',
] as const;

const nameOf = (x: number, y: number) => `${7 - y},${x}`;

export class Control<C extends ControlType>
  extends Component
  implements IControl<C>
{
  bindings: C['bindings'];
  bindingTemplates: ControlTemplate<C>['bindings'];
  state: C['state'];
  context: ControlContext;

  constructor(ctx: ControlContext, controlTemplate: ControlTemplate<C>) {
    super();

    const bindings: { [k: string]: any } = {};
    for (const k in controlTemplate.bindings) {
      const bt = controlTemplate.bindings[k];
      bindings[k] =
        bt.type == 'control'
          ? new ControlComponent(bt.target)
          : new MidiComponent(
              ctx.device,
              ctx.device.controls[nameOf(...bt.target)]
            );
    }
    this.bindingTemplates = controlTemplate.bindings;
    this.bindings = bindings;
    this.state = controlTemplate.state;
    this.context = ctx;
  }

  onMount() {
    super.onMount();

    Object.keys(this.bindings).forEach((k) => {
      const b = this.bindings[k]
      if (b instanceof ControlComponent) {
        const bt = this.bindingTemplates[k] as ControlBindingTemplate<any>;
        controlListeners.forEach((event) => {
          const listener = bt[event];
          if (listener != null) {
            b.addListener(event, listener(this));
          }
        });
      } else {
        const bt = this.bindingTemplates[k] as ButtonBindingTemplate<any>;
        midiListeners.forEach((event) => {
          const listener = bt[event];
          if (listener) {
            b.addListener(event, listener(this));
          }
        });
        // add a default handler to clear the button LED
        b.addListener('unmount', () => {
          this.context.device.clearColor(b.control);
        });
      }
    });

    Object.values(this.bindings).forEach((b) => b.mount());
  }

  onUnmount() {
    const bs = Object.values(this.bindings)
    bs.forEach((b) => b.unmount());
    bs.forEach((b) => b.removeAllListeners());
    super.onUnmount();
  }
}

export type PresetConf = {
  grid: readonly { pos: [number, number]; control: ControlConf<ControlTypeIndex> }[];
};

type PresetTemplate = {
  controls: ControlTemplate<any>[];
};

export type IPreset = {
  controls: IControl<any>[];
};

export class Preset extends Component implements IPreset {
  controls: Control<any>[];

  constructor(ctx: ControlContext, presetTemplate: PresetTemplate) {
    super()
    this.controls = presetTemplate.controls.map((c) => new Control(ctx, c));
  }

  onMount() {
    super.onMount()
    for (const control of this.controls) {
      control.mount()
    }
  }

  onUnmount() {
    for (const control of this.controls) {
      control.unmount()
    }
    super.onUnmount()
  }
}

const tr = (a: number[], b: number[]): [number, number] => [a[0] + b[0], a[1] + b[1]]

export const makePresetTemplate = (conf: PresetConf, gridPosition: [number, number], deck: ChannelControlDef): PresetTemplate => ({
  controls: conf.grid.map(({pos, control:{type, params}}) =>
    makeControlTemplateIndex[type](params as unknown as any, tr(gridPosition, pos), deck)
  )
})
