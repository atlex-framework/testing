import { db } from '@atlex/orm'
import type { Model } from '@atlex/orm'

import type { VitestMatcherContext } from '../matcherContext.js'

/**
 * Vitest matcher: model row exists in database.
 */
export async function toExistInDatabase(
  this: VitestMatcherContext,
  received: unknown,
  table?: string,
  column = 'id',
): Promise<{ message: () => string; pass: boolean }> {
  if (!(received instanceof Object) || received === null || !('getAttributes' in received)) {
    return {
      pass: false,
      message: () => `expected Model instance, got ${this.utils.printReceived(received)}`,
    }
  }
  const model = received as Model
  const ctor = model.constructor as typeof Model & { table?: string }
  const tbl = table ?? ctor.table
  if (typeof tbl !== 'string') {
    return { pass: false, message: () => 'model must have static table' }
  }
  const id = model.getAttributes()[column]
  const row = await db(tbl)
    .where(column, id as string | number)
    .first()
  const pass = row !== null && row !== undefined
  return {
    pass,
    message: () =>
      pass
        ? `expected model ${String(id)} not to exist in "${tbl}"`
        : `expected model ${String(id)} to exist in "${tbl}"`,
  }
}

/**
 * Vitest matcher: soft-deleted model (`deleted_at` set).
 */
export function toBeSoftDeleted(
  this: VitestMatcherContext,
  received: unknown,
): {
  message: () => string
  pass: boolean
} {
  if (!(received instanceof Object) || received === null || !('getAttributes' in received)) {
    return {
      pass: false,
      message: () => `expected Model instance, got ${this.utils.printReceived(received)}`,
    }
  }
  const deleted = (received as Model).getAttributes().deleted_at
  const pass = deleted !== null && deleted !== undefined
  return {
    pass,
    message: () =>
      pass
        ? 'expected model not to be soft-deleted'
        : 'expected model to be soft-deleted (deleted_at)',
  }
}
