import { ConnectionRegistry } from '@atlex/orm'
import { afterEach, beforeEach } from 'vitest'

import { truncateAllTables } from './truncateAllTables.js'

export interface RefreshDatabaseOptions {
  connection?: string
  seed?: boolean
  seeder?: new () => { run(): Promise<void> }
}

/**
 * Truncate all application tables before each test (requires an active default connection).
 *
 * @param options - Optional seeder hook after truncate.
 */
export function refreshDatabase(options: RefreshDatabaseOptions = {}): void {
  beforeEach(async () => {
    const conn = ConnectionRegistry.instance().connection(options.connection)
    const knex = conn._knex()
    await truncateAllTables(knex)
    if (options.seed === true && options.seeder !== undefined) {
      await new options.seeder().run()
    }
  })

  afterEach(() => {
    /* truncate runs again next test */
  })
}
