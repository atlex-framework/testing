import type { AtlexFaker } from './atlexFaker.js'
import { fake } from './fake.js'

interface ModelWithCreate {
  create(attributes: Record<string, unknown>): Promise<unknown>
}

/**
 * Base class for model factories: bind a `static model`, implement {@link definition}, then {@link create} or {@link createMany}.
 *
 * @example
 * ```ts
 * export class UserFactory extends Factory {
 *   public static model = User;
 *   protected definition(): Record<string, unknown> {
 *     const f = this.faker();
 *     return { name: f.name(), email: f.unique().safeEmail() };
 *   }
 * }
 * await new UserFactory().create();
 * await new UserFactory().createMany(10);
 * ```
 */
export abstract class Factory {
  /**
   * The model class this factory persists (must expose `create(attributes)`).
   */
  public static model: ModelWithCreate | undefined

  /**
   * Default attribute set for one record.
   */
  protected abstract definition(): Record<string, unknown>

  /**
   * Faker for use inside {@link definition}.
   */
  protected faker(): AtlexFaker {
    return fake()
  }

  /**
   * Build attributes for one record without persisting.
   */
  public make(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return { ...this.definition(), ...overrides }
  }

  /**
   * Build `count` attribute objects; each call runs {@link definition} again (fresh random values).
   */
  public makeMany(
    count: number,
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown>[] {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(
        `Factory.makeMany: count must be a non-negative integer, got ${String(count)}`,
      )
    }
    const rows: Record<string, unknown>[] = []
    for (let i = 0; i < count; i += 1) {
      rows.push(this.make(overrides))
    }
    return rows
  }

  /**
   * Persist one model using {@link Factory.model}.
   */
  public async create(overrides: Record<string, unknown> = {}): Promise<unknown> {
    const Ctor = this.constructor as typeof Factory
    const ModelClass = Ctor.model
    if (ModelClass === undefined || typeof ModelClass.create !== 'function') {
      throw new Error(
        `${Ctor.name} must set static model = YourModel (a class with create(attributes)).`,
      )
    }
    return await ModelClass.create(this.make(overrides))
  }

  /**
   * Persist `count` models; each row uses a fresh {@link definition} (unless `overrides` fixes fields).
   */
  public async createMany(
    count: number,
    overrides: Record<string, unknown> = {},
  ): Promise<unknown[]> {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(
        `Factory.createMany: count must be a non-negative integer, got ${String(count)}`,
      )
    }
    const Ctor = this.constructor as typeof Factory
    const ModelClass = Ctor.model
    if (ModelClass === undefined || typeof ModelClass.create !== 'function') {
      throw new Error(
        `${Ctor.name} must set static model = YourModel (a class with create(attributes)).`,
      )
    }
    const rows: unknown[] = []
    for (let i = 0; i < count; i += 1) {
      rows.push(await ModelClass.create(this.make(overrides)))
    }
    return rows
  }
}
