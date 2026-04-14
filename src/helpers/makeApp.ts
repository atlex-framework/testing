import { Application } from '@atlex/core'

/**
 * Instantiate a bare {@link Application} for low-level tests (no providers).
 *
 * @returns New application instance.
 */
export function makeEmptyApplication(): Application {
  return new Application()
}
