import type { VitestMatcherContext } from '../matcherContext.js'
import type { TestResponse } from '../TestResponse.js'

/**
 * Vitest matcher: JSON body contains validation errors for fields.
 */
export function toHaveValidationErrors(
  this: VitestMatcherContext,
  received: unknown,
  fields: string[],
): { message: () => string; pass: boolean } {
  const body: unknown =
    received instanceof Object && received !== null && 'json' in received
      ? (received as TestResponse).json()
      : received
  const errors = (body as { error?: { errors?: Record<string, unknown> } })?.error?.errors
  if (errors === undefined || typeof errors !== 'object') {
    return {
      pass: false,
      message: () => 'expected response with `error.errors` validation payload',
    }
  }
  const pass = fields.every((f) => {
    const v = errors[f]
    return v !== undefined && (!Array.isArray(v) || v.length > 0)
  })
  return {
    pass,
    message: () =>
      pass
        ? `expected not to have validation errors for ${this.utils.printExpected(fields)}`
        : `expected validation errors for ${this.utils.printExpected(fields)}`,
  }
}
