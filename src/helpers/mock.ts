import { vi } from 'vitest'

/**
 * Build a no-op Redis-like client stub (connection tests without IORedis).
 *
 * @returns Minimal async map with `get` / `set` / `quit` spies.
 */
export function createRedisMock(): {
  get: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  del: ReturnType<typeof vi.fn>
  quit: ReturnType<typeof vi.fn>
} {
  const store = new Map<string, string>()
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value)
      return 'OK'
    }),
    del: vi.fn(async (key: string) => {
      store.delete(key)
      return 1
    }),
    quit: vi.fn(async () => 'OK'),
  }
}

/**
 * Minimal SMTP transport stub for mail integration tests.
 *
 * @returns Object with `sendMail` spy.
 */
export function createSmtpMock(): {
  sendMail: ReturnType<typeof vi.fn>
} {
  return {
    sendMail: vi.fn(async () => ({ messageId: 'test-id' })),
  }
}
