import { AssertionError } from 'node:assert'

import type { Application } from '@atlex/core'
import type { LogDriver, LogEntry, LogManager } from '@atlex/log'
import { LogContext, Logger, LogLevel, parseLogLevel } from '@atlex/log'

import { onTestingCleanup } from '../helpers/testCleanup.js'

interface Row {
  level: LogLevel
  message: string
  context: Record<string, unknown>
}

/**
 * Minimal {@link LogManager} stand-in that records all channels to one capturing logger.
 */
class LogManagerDouble {
  private readonly rows: Row[] = []

  private readonly logger: Logger

  public constructor() {
    const driver: LogDriver = {
      write: (entry: LogEntry) => {
        this.rows.push({
          level: entry.level,
          message: entry.message,
          context: { ...entry.context },
        })
      },
    }
    this.logger = new Logger(driver, 'testing', LogLevel.DEBUG, new LogContext(), {})
  }

  /**
   * @returns Same logger for every channel name.
   */
  public channel(_name: string): Logger {
    return this.logger
  }

  public getLogged(): readonly Row[] {
    return this.rows
  }
}

/**
 * Capture log output in tests.
 */
export class LogFake {
  private readonly inner = new LogManagerDouble()

  /**
   * Replace the `log` binding with a capturing manager.
   *
   * @param app - Application instance.
   * @returns Fake for assertions.
   */
  public static fake(app: Application): LogFake {
    const fake = new LogFake()
    let previous: LogManager | undefined
    try {
      previous = app.make<LogManager>('log')
    } catch {
      previous = undefined
    }
    app.container.instance('log', fake.inner as unknown as LogManager)
    onTestingCleanup(() => {
      if (previous !== undefined) {
        app.container.instance('log', previous)
      }
    })
    return fake
  }

  /**
   * Assert a severity was logged.
   *
   * @param level - Log level string (e.g. `info`, `error`).
   * @param callback - Optional matcher on message + context.
   */
  public assertLogged(
    level: string,
    callback?: (message: string, context: Record<string, unknown>) => boolean,
  ): void {
    const want = parseLogLevel(level)
    const ok = this.inner.getLogged().some((r) => {
      if (r.level !== want) {
        return false
      }
      return callback ? callback(r.message, r.context) : true
    })
    if (!ok) {
      throw new AssertionError({ message: `Expected log level "${level}" to be recorded.` })
    }
  }

  /**
   * Assert exact number of logs at a level.
   *
   * @param level - Log level string.
   * @param times - Expected count.
   */
  public assertLoggedTimes(level: string, times: number): void {
    const want = parseLogLevel(level)
    const n = this.inner.getLogged().filter((r) => r.level === want).length
    if (n !== times) {
      throw new AssertionError({
        message: `Expected ${String(times)} log(s) at "${level}", got ${String(n)}.`,
      })
    }
  }

  /**
   * Assert a level was never logged.
   *
   * @param level - Log level string.
   */
  public assertNotLogged(level: string): void {
    const want = parseLogLevel(level)
    if (this.inner.getLogged().some((r) => r.level === want)) {
      throw new AssertionError({ message: `Expected no logs at "${level}".` })
    }
  }

  /** Assert no logs captured. */
  public assertNothingLogged(): void {
    if (this.inner.getLogged().length > 0) {
      throw new AssertionError({
        message: `Expected no logs, got ${String(this.inner.getLogged().length)}.`,
      })
    }
  }

  /**
   * Entries for a level.
   *
   * @param level - Log level string.
   * @returns Log rows.
   */
  public logged(level: string): { message: string; context: Record<string, unknown> }[] {
    const want = parseLogLevel(level)
    return this.inner
      .getLogged()
      .filter((r) => r.level === want)
      .map((r) => ({ message: r.message, context: r.context }))
  }
}
