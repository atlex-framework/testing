import { AssertionError } from 'node:assert'

import type { Job } from '@atlex/queue'
import { QueueManager, _getQueueManager, _setQueueManager, defaultQueueConfig } from '@atlex/queue'

import { onTestingCleanup } from '../helpers/testCleanup.js'

interface Pushed {
  job: Job
  queue: string
  connection: string | null
}

function jobClassName(ctor: new (...args: never[]) => Job): string {
  return ctor.name || 'Job'
}

/**
 * Captures queued jobs instead of sending them to a real backend.
 */
export class QueueFake extends QueueManager {
  private readonly captured: Pushed[] = []

  public constructor() {
    super({
      ...defaultQueueConfig,
      default: 'default',
      connections: { ...defaultQueueConfig.connections, default: { driver: 'null' } },
    })
  }

  /**
   * Install a fake queue manager for the current test process.
   *
   * @returns Fake instance.
   */
  public static fake(): QueueFake {
    const previous = _getQueueManager()
    const fake = new QueueFake()
    _setQueueManager(fake)
    onTestingCleanup(() => {
      _setQueueManager(previous)
    })
    return fake
  }

  /** @inheritdoc */
  public override async push(job: Job): Promise<string> {
    const payload = job.serialize()
    this.captured.push({ job, queue: payload.queue, connection: payload.connection })
    return payload.uuid
  }

  /**
   * Assert a job class was pushed at least once.
   *
   * @param jobClass - Job constructor.
   * @param callback - Optional predicate on the job instance.
   */
  public assertPushed(
    jobClass: new (...args: never[]) => Job,
    callback?: (j: Job) => boolean,
  ): void {
    const ok = this.captured.some(
      (p) => p.job instanceof jobClass && (callback ? callback(p.job) : true),
    )
    if (!ok) {
      throw new AssertionError({
        message: `Expected [${jobClassName(jobClass)}] to be pushed, but it was not.`,
      })
    }
  }

  /**
   * Assert a job was pushed onto a named queue.
   *
   * @param queue - Queue name.
   * @param jobClass - Job constructor.
   */
  public assertPushedOn(queue: string, jobClass: new (...args: never[]) => Job): void {
    const ok = this.captured.some((p) => p.job instanceof jobClass && p.queue === queue)
    if (!ok) {
      throw new AssertionError({
        message: `Expected [${jobClassName(jobClass)}] on queue "${queue}", but it was not.`,
      })
    }
  }

  /**
   * Assert chained jobs match expected order (by serialized job name).
   *
   * @param jobClass - Root job class.
   * @param chain - Expected chain job classes.
   */
  public assertPushedWithChain(
    jobClass: new (...args: never[]) => Job,
    chain: (new (...args: never[]) => Job)[],
  ): void {
    const hit = this.captured.find((p) => p.job instanceof jobClass)
    if (hit === undefined) {
      throw new AssertionError({
        message: `Expected [${jobClassName(jobClass)}] to be pushed with chain.`,
      })
    }
    const names = hit.job.serialize().chained.map((c) => c.job)
    const expectedShort = chain.map((c) => c.name)
    const okLen = names.length === expectedShort.length
    const okEach =
      okLen &&
      names.every((n, i) => {
        const want = expectedShort[i] ?? ''
        return n === want || n.endsWith(`:${want}`) || n.endsWith(want)
      })
    if (!okEach) {
      throw new AssertionError({
        message: `Expected chain ${JSON.stringify(expectedShort)}, got ${JSON.stringify(names)}.`,
      })
    }
  }

  /**
   * Assert a job was never pushed.
   *
   * @param jobClass - Job constructor.
   */
  public assertNotPushed(jobClass: new (...args: never[]) => Job): void {
    if (this.captured.some((p) => p.job instanceof jobClass)) {
      throw new AssertionError({
        message: `Expected [${jobClassName(jobClass)}] not to be pushed, but it was.`,
      })
    }
  }

  /** Assert no jobs were pushed. */
  public assertNothingPushed(): void {
    if (this.captured.length > 0) {
      throw new AssertionError({
        message: `Expected no jobs pushed, got ${String(this.captured.length)}.`,
      })
    }
  }

  /** Assert exact number of pushed jobs (all classes). */
  public assertCount(count: number): void {
    if (this.captured.length !== count) {
      throw new AssertionError({
        message: `Expected ${String(count)} pushed job(s), got ${String(this.captured.length)}.`,
      })
    }
  }

  /**
   * All pushed instances for a job class.
   *
   * @param jobClass - Job constructor.
   * @returns Job instances.
   */
  public pushed(jobClass: new (...args: never[]) => Job): Job[] {
    return this.captured.filter((p) => p.job instanceof jobClass).map((p) => p.job)
  }
}
