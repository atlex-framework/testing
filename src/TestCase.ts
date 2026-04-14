/**
 * Optional base class for grouping common test utilities.
 */
export abstract class TestCase {
  /**
   * Runs once before the suite (override in subclasses).
   */
  public static async beforeAll(): Promise<void> {
    return
  }

  /**
   * Runs once after the suite (override in subclasses).
   */
  public static async afterAll(): Promise<void> {
    return
  }
}
