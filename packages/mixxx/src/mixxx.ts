export type ControlCallback = (value: number, group: string, control: string) => void
export type TimerCallback = () => void

export type Connection = {
  isConnected: boolean
  disconnect(): void
  trigger(): void
}

export type Engine = {
  getValue(group: string, name: string): number
  setValue(group: string, name: string, value: number): void
  beginTimer(intervalMs: number, cb: TimerCallback): number
  stopTimer(handle: number): void
  makeConnection(group: string, name: string, callback: ControlCallback): Connection
}

export type Midi = {
  sendShortMsg(byte1: number, byte2: number, byte3: number): void
  sendSysexMsg(bytes: number[]): void
}
