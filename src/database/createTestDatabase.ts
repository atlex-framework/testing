import { Connection, ConnectionRegistry, type DatabaseConfig } from '@atlex/orm'

/**
 * Create an isolated in-memory SQLite connection and register it as default.
 *
 * @param overrides - Optional driver overrides.
 * @returns Ready connection.
 */
export async function createTestDatabase(
  overrides: Partial<DatabaseConfig> = {},
): Promise<Connection> {
  ConnectionRegistry.resetForTests()
  const conn = Connection.resolve({
    driver: 'better-sqlite3',
    database: ':memory:',
    filename: ':memory:',
    pool: { min: 1, max: 1 },
    ...overrides,
  })
  ConnectionRegistry.instance().extend('default', conn)
  return conn
}
