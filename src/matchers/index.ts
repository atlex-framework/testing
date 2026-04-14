import { expect } from 'vitest'

import { toBeAuthenticated } from './auth.js'
import { toHaveCount } from './collection.js'
import { toBeSoftDeleted, toExistInDatabase } from './database.js'
import { toBeModel, toMatchModel } from './model.js'
import { toHaveValidationErrors } from './validation.js'

const registered = Symbol.for('atlex.testing.matchersRegistered')

/**
 * Register all custom Vitest matchers (idempotent).
 */
export function registerMatchers(): void {
  const g = globalThis as unknown as Record<symbol, boolean>
  if (g[registered]) {
    return
  }
  g[registered] = true
  expect.extend({
    toBeModel,
    toMatchModel,
    toHaveCount,
    toHaveValidationErrors,
    toBeAuthenticated,
    toExistInDatabase,
    toBeSoftDeleted,
  })
}

export { toBeAuthenticated } from './auth.js'
export { toHaveCount } from './collection.js'
export { toBeSoftDeleted, toExistInDatabase } from './database.js'
export { toBeModel, toMatchModel } from './model.js'
export { toHaveValidationErrors } from './validation.js'
