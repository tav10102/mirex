export type RecordedCodeBlock = (
  record: (x: any) => any,
  wait: (t: number, op: () => any) => void,
  now: () => number,
) => void

export function run(fn: RecordedCodeBlock): any[] {
  jest.useFakeTimers()
  try {
    const state = {
      complete: false,
      recording: [] as any[],
      tick: 0,
    }
    const record = (x: any) => {
      state.recording.push(x)
    }
    const wait = (t: number, op: () => any) => {
      setTimeout(op, t)
    }
    const now = () => state.tick
    fn(record, wait, now)
    wait(10000, () => (state.complete = true))
    while (!state.complete) {
      jest.runAllTicks()
      jest.runAllImmediates()
      ++state.tick
      jest.advanceTimersByTime(1)
    }
    return state.recording
  } finally {
    jest.clearAllTimers()
    jest.useRealTimers()
  }
}
