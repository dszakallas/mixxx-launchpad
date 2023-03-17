import {
  playListControlDef,
  Timer,
  setValue,
  Component,
  MidiComponent,
} from '@mixxx-launchpad/mixxx';
import type { MidiMessage, ControlDef } from '@mixxx-launchpad/mixxx';
import { LaunchpadDevice } from '.';

const longInterval = 240 as const;
const mediumInterval = 120 as const;
const shortInterval = 60 as const;
const minInterval = 30 as const;

const autoscrolled = (binding: Component) => {
  let started: number | null = null;
  let interval: number | null = null;
  let timer: Timer | null = null;

  binding.on('midi', (data: MidiMessage) => {
    // unsafe cast: timer should be initialized at this point
    timer = timer as Timer;
    if (data.value) {
      interval = longInterval;
      started = timer.start(interval);
    } else {
      timer.end();
    }
  });

  binding.on('mount', () => {
    timer = new Timer(() => {
      binding.emit('scroll');
      // unsafe cast: interval should be initialized at this point
      interval = interval as number;
      // unsafe cast: timer should be initialized at this point
      timer = timer as Timer;
      // unsafe cast: started should be initialized at this point
      started = started as number;
      if (interval > minInterval) {
        const current = Date.now();
        if (interval === longInterval && current - (started as number) > 1500) {
          interval = mediumInterval;
          timer.restart(interval);
        } else if (
          interval === mediumInterval &&
          current - (started as number) > 3000
        ) {
          interval = shortInterval;
          timer.restart(interval);
        } else if (
          interval === shortInterval &&
          current - (started as number) > 6000
        ) {
          interval = minInterval;
          timer.restart(interval);
        }
      }
    });
  });

  binding.on('unmount', () => {
    (timer as Timer).unmount();
  });

  return binding;
};

export default class PlaylistSidebar extends Component {
  buttons: MidiComponent[];

  constructor(device: LaunchpadDevice) {
    super();

    const onScroll = (control: ControlDef) => () => {
      setValue(control, 1);
    };

    const onMidi = (control: ControlDef) => (message: MidiMessage) => {
      if (message.value) {
        setValue(control, 1);
        device.sendColor(message.control, device.colors.hi_red);
      } else {
        device.sendColor(message.control, device.colors.hi_yellow);
      }
    };

    const onMount = (button: MidiComponent) => {
      device.sendColor(button.control, device.colors.hi_yellow);
    };

    const onUnmount = (button: MidiComponent) => {
      device.clearColor(button.control);
    };

    const btns = [
      new MidiComponent(device, device.controls.vol),
      new MidiComponent(device, device.controls.pan),
      new MidiComponent(device, device.controls.snda),
      new MidiComponent(device, device.controls.sndb),
      new MidiComponent(device, device.controls.stop),
    ];

    const prevPlaylist = autoscrolled(btns[0]);
    const nextPlaylist = autoscrolled(btns[1]);
    const toggleItem = btns[2];
    const prevTrack = autoscrolled(btns[3]);
    const nextTrack = autoscrolled(btns[4]);

    prevPlaylist.on('scroll', onScroll(playListControlDef.SelectPrevPlaylist));
    prevPlaylist.on('midi', onMidi(playListControlDef.SelectPrevPlaylist));
    prevPlaylist.on('mount', onMount);
    prevPlaylist.on('unmount', onUnmount);

    nextPlaylist.on('scroll', onScroll(playListControlDef.SelectNextPlaylist));
    nextPlaylist.on('midi', onMidi(playListControlDef.SelectNextPlaylist));
    nextPlaylist.on('mount', onMount);
    nextPlaylist.on('unmount', onUnmount);

    prevTrack.on('scroll', onScroll(playListControlDef.SelectPrevTrack));
    prevTrack.on('midi', onMidi(playListControlDef.SelectPrevTrack));
    prevTrack.on('mount', onMount);
    prevTrack.on('unmount', onUnmount);

    nextTrack.on('scroll', onScroll(playListControlDef.SelectNextTrack));
    nextTrack.on('midi', onMidi(playListControlDef.SelectNextTrack));
    nextTrack.on('mount', onMount);
    nextTrack.on('unmount', onUnmount);

    toggleItem.on('midi', onMidi(playListControlDef.ToggleSelectedSidebarItem));
    toggleItem.on('mount', onMount);
    toggleItem.on('unmount', onUnmount);

    this.buttons = btns;
  }

  onMount() {
    super.onMount();
    this.buttons.forEach((button) => button.mount());
  }

  onUnmount() {
    this.buttons.forEach((button) => button.unmount());
    super.onUnmount();
  }
}
