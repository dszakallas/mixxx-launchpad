import { LaunchDevice, Pad as BasePad } from '@mixxx-launch/launch-common'

export abstract class LaunchpadDevice extends LaunchDevice {}

export class Pad extends BasePad<LaunchpadDevice> {}
