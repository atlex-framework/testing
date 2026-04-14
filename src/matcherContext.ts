/**
 * Minimal `this` context passed to Vitest custom matchers.
 */
export interface VitestMatcherContext {
  readonly utils: {
    printReceived(value: unknown): string
    printExpected(value: unknown): string
  }
}
