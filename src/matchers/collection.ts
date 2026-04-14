import type { VitestMatcherContext } from '../matcherContext.js'

/**
 * Vitest matcher: array-like length.
 */
export function toHaveCount(
  this: VitestMatcherContext,
  received: unknown,
  count: number,
): {
  message: () => string
  pass: boolean
} {
  const len = Array.isArray(received)
    ? received.length
    : received !== null &&
        typeof received === 'object' &&
        'length' in received &&
        typeof (received as { length: unknown }).length === 'number'
      ? Number((received as { length: number }).length)
      : null
  const pass = len === count
  return {
    pass,
    message: () =>
      pass
        ? `expected length not to be ${String(count)}`
        : `expected length ${String(count)}, got ${String(len)}`,
  }
}
