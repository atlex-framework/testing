import { type Model } from '@atlex/orm'

import type { VitestMatcherContext } from '../matcherContext.js'

/**
 * Vitest matcher: value is an instance of the given model class.
 */
export function toBeModel(
  this: VitestMatcherContext,
  received: unknown,
  modelClass: typeof Model,
): {
  message: () => string
  pass: boolean
} {
  const pass = received instanceof modelClass
  return {
    pass,
    message: () =>
      pass
        ? `expected ${this.utils.printReceived(received)} not to be an instance of ${modelClass.name}`
        : `expected ${this.utils.printReceived(received)} to be an instance of ${modelClass.name}`,
  }
}

/**
 * Vitest matcher: model attributes contain expected subset.
 */
export function toMatchModel(
  this: VitestMatcherContext,
  received: unknown,
  attributes: Record<string, unknown>,
): { message: () => string; pass: boolean } {
  if (!(received instanceof Object) || received === null || !('getAttributes' in received)) {
    return {
      pass: false,
      message: () => `expected a Model-like object, got ${this.utils.printReceived(received)}`,
    }
  }
  const attrs = (received as Model).getAttributes()
  const pass = Object.entries(attributes).every(([k, v]) => attrs[k] === v)
  return {
    pass,
    message: () =>
      pass
        ? `expected model not to match ${this.utils.printExpected(attributes)}`
        : `expected model attributes to match ${this.utils.printExpected(attributes)}, got ${this.utils.printReceived(attrs)}`,
  }
}
