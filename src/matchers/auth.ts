import type { Guard } from '@atlex/auth'

import type { VitestMatcherContext } from '../matcherContext.js'

/**
 * Vitest matcher: guard already has a resolved user (`hasUser()`), e.g. after {@link TestClient.actingAs}.
 */
export function toBeAuthenticated(
  this: VitestMatcherContext,
  received: unknown,
): {
  message: () => string
  pass: boolean
} {
  if (received === null || typeof received !== 'object' || !('hasUser' in received)) {
    return {
      pass: false,
      message: () => `expected a Guard, got ${this.utils.printReceived(received)}`,
    }
  }
  const guard = received as Guard
  const pass = guard.hasUser()
  return {
    pass,
    message: () =>
      pass
        ? 'expected guard not to be authenticated'
        : 'expected guard to be authenticated (set user on guard first)',
  }
}
