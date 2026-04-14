import type { Knex } from 'knex'

/**
 * Delete all rows from user tables (best-effort per dialect).
 *
 * @param knex - Knex instance.
 */
export async function truncateAllTables(knex: Knex): Promise<void> {
  const client = knex.client.config.client

  if (client === 'better-sqlite3' || client === 'sqlite3') {
    await knex.raw('PRAGMA foreign_keys = OFF')
    const rows: { name: string }[] = await knex
      .select<{ name: string }>('name')
      .from('sqlite_master')
      .where('type', 'table')
      .andWhereRaw("name NOT LIKE 'sqlite_%'")
      .andWhereRaw("name NOT LIKE 'knex_%'")
    for (const { name } of rows) {
      const safe = name.replace(/"/g, '""')
      await knex.raw(`DELETE FROM "${safe}"`)
    }
    await knex.raw('PRAGMA foreign_keys = ON')
    return
  }

  if (client === 'pg') {
    const res = (await knex.raw(
      "SELECT tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')",
    )) as unknown as { rows: { tablename: string }[] }
    const rows = res.rows
    if (rows.length === 0) {
      return
    }
    const list = rows.map((r) => `"${r.tablename.replace(/"/g, '""')}"`).join(', ')
    await knex.raw(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`)
    return
  }

  if (client === 'mysql2') {
    const [tableRows] = (await knex.raw('SHOW TABLES')) as unknown as [
      Record<string, string>[],
      unknown,
    ]
    if (!Array.isArray(tableRows) || tableRows.length === 0) {
      return
    }
    const col = Object.keys(tableRows[0] ?? {})[0]
    if (col === undefined) {
      return
    }
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0')
    for (const row of tableRows) {
      const name = row[col]
      if (typeof name === 'string') {
        const safe = name.replace(/`/g, '``')
        await knex.raw(`TRUNCATE TABLE \`${safe}\``)
      }
    }
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1')
  }
}
