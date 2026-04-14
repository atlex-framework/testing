import { afterEach, vi } from 'vitest'

let frozen = false

/**
 * Freeze `Date` / timers at the given instant (Vitest fake timers).
 *
 * @param date - Moment to freeze; defaults to `new Date()`.
 */
export function freezeTime(date: Date = new Date()): void {
  vi.useFakeTimers({ now: date })
  frozen = true
}

/**
 * Jump the fake clock to a specific date.
 *
 * @param date - Target instant.
 */
export function travelTo(date: Date): void {
  if (!frozen) {
    vi.useFakeTimers()
    frozen = true
  }
  vi.setSystemTime(date)
}

/**
 * Advance fake time by milliseconds.
 *
 * @param ms - Milliseconds to move forward.
 */
export function travelForward(ms: number): void {
  vi.advanceTimersByTime(ms)
}

/**
 * Move fake time backward by milliseconds.
 *
 * @param ms - Milliseconds to move back.
 */
export function travelBack(ms: number): void {
  const base = vi.getMockedSystemTime?.() ?? new Date()
  vi.setSystemTime(new Date(base.getTime() - ms))
}

/**
 * Restore real timers.
 */
export function unfreezeTime(): void {
  if (frozen) {
    vi.useRealTimers()
    frozen = false
  }
}

/**
 * Current mocked system time when fake timers are enabled.
 *
 * @returns Current time from Vitest, or real `Date` otherwise.
 */
export function now(): Date {
  const mocked = vi.getMockedSystemTime?.()
  return mocked ?? new Date()
}

afterEach(() => {
  unfreezeTime()
})
