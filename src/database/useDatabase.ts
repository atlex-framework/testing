import { ConnectionRegistry } from '@atlex/orm'
import type { Knex } from 'knex'
import { afterEach, beforeEach } from 'vitest'

/**
 * Wrap each test in a database transaction that rolls back automatically.
 *
 * @param options - Optional named connection.
 */
export function useDatabase(options?: { connection?: string }): void {
  let trx: Knex.Transaction | null = null

  beforeEach(async () => {
    const conn = ConnectionRegistry.instance().connection(options?.connection)
    const knex = conn._knex()
    trx = await knex.transaction()
    ConnectionRegistry.instance().bindTestTransaction(trx)
  })

  afterEach(async () => {
    ConnectionRegistry.instance().unbindTestTransaction()
    if (trx !== null) {
      try {
        await trx.rollback()
      } catch {
        /* already finished */
      }
      trx = null
    }
  })
}
