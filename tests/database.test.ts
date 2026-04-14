import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ConnectionRegistry, db } from '@atlex/orm'

import { createTestDatabase } from '../src/database/createTestDatabase.js'
import { useDatabase } from '../src/database/useDatabase.js'

describe('createTestDatabase', () => {
  it('opens sqlite memory', async () => {
    ConnectionRegistry.resetForTests()
    const conn = await createTestDatabase()
    const ok = await conn.ping()
    expect(ok).toBe(true)
    await conn.close()
    ConnectionRegistry.resetForTests()
  })
})

describe('useDatabase transaction', () => {
  beforeAll(async () => {
    ConnectionRegistry.resetForTests()
    await createTestDatabase()
    await ConnectionRegistry.instance()
      .default()
      ._knex()
      .schema.createTable('tdb1', (t) => {
        t.increments('id')
        t.string('n', 32)
      })
  })

  afterAll(async () => {
    const c = ConnectionRegistry.instance().default()
    await c.close()
    ConnectionRegistry.resetForTests()
  })

  useDatabase()

  it('first test inserts within transaction', async () => {
    await db('tdb1').insert({ n: 'x' })
    const n = await db('tdb1').count()
    expect(n).toBe(1)
  })

  it('second test sees rolled-back state', async () => {
    const n = await db('tdb1').count()
    expect(n).toBe(0)
  })
})
