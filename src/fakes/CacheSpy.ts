import { CacheFake } from '@atlex/cache'
import type { Application } from '@atlex/core'

/**
 * Install {@link CacheFake} on the container (spy-style alias).
 *
 * @param app - Application instance.
 * @returns Active {@link CacheFake}.
 */
export function cacheSpy(app: Application): CacheFake {
  return CacheFake.fake(app.container)
}
