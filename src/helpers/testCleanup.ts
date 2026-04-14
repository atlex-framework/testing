import { afterEach } from 'vitest'

const cleanups: (() => void | Promise<void>)[] = []

let installed = false

function ensureHook(): void {
  if (installed) {
    return
  }
  installed = true
  afterEach(async () => {
    while (cleanups.length > 0) {
      const fn = cleanups.pop()
      if (fn !== undefined) {
        await fn()
      }
    }
  })
}

/**
 * Register a function to run after each test (LIFO). Used by fakes to restore services.
 *
 * @param fn - Cleanup callback.
 */
export function onTestingCleanup(fn: () => void | Promise<void>): void {
  ensureHook()
  cleanups.push(fn)
}
