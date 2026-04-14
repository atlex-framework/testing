import { describe, expect, it } from 'vitest'

import { Factory } from '../src/Factory.js'

class FakeUserModel {
  public static async create(
    attributes: Record<string, unknown>,
  ): Promise<{ id: number } & Record<string, unknown>> {
    return { id: 1, ...attributes }
  }
}

class UserFactory extends Factory {
  public static override model = FakeUserModel

  protected definition(): Record<string, unknown> {
    return { name: 'Test', email: 'test@example.com' }
  }
}

describe('Factory', () => {
  it('make merges definition with overrides', () => {
    const attrs = new UserFactory().make({ name: 'Over' })
    expect(attrs.name).toBe('Over')
    expect(attrs.email).toBe('test@example.com')
  })

  it('create persists via static model', async () => {
    const row = await new UserFactory().create({ name: 'Persisted' })
    expect(row).toMatchObject({ id: 1, name: 'Persisted', email: 'test@example.com' })
  })

  it('create throws when model is missing', async () => {
    class BadFactory extends Factory {
      protected definition(): Record<string, unknown> {
        return {}
      }
    }
    await expect(new BadFactory().create()).rejects.toThrow(/must set static model/)
  })

  it('makeMany builds count rows with fresh definition each time', () => {
    let n = 0
    class CountFactory extends Factory {
      public static override model = FakeUserModel

      protected definition(): Record<string, unknown> {
        n += 1
        return { n }
      }
    }
    const rows = new CountFactory().makeMany(3)
    expect(rows).toHaveLength(3)
    expect(rows[0]?.n).toBe(1)
    expect(rows[1]?.n).toBe(2)
    expect(rows[2]?.n).toBe(3)
  })

  it('createMany persists count rows', async () => {
    let id = 0
    class SeqModel {
      public static async create(
        attributes: Record<string, unknown>,
      ): Promise<Record<string, unknown>> {
        id += 1
        return { id, ...attributes }
      }
    }
    class SeqFactory extends Factory {
      public static override model = SeqModel

      protected definition(): Record<string, unknown> {
        return { tag: 'row' }
      }
    }
    const rows = await new SeqFactory().createMany(2)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ id: 1, tag: 'row' })
    expect(rows[1]).toMatchObject({ id: 2, tag: 'row' })
  })

  it('createMany rejects invalid count', async () => {
    await expect(new UserFactory().createMany(-1)).rejects.toThrow(/non-negative integer/)
  })
})
