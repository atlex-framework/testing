import { AssertionError } from 'node:assert'

import type { Application } from '@atlex/core'
import { MemoryDriver } from '@atlex/storage'
import type { StorageManager } from '@atlex/storage'

import { onTestingCleanup } from '../helpers/testCleanup.js'

/**
 * In-memory storage fake with assertion helpers.
 */
export class StorageFake {
  private readonly driver: MemoryDriver

  private constructor(driver: MemoryDriver) {
    this.driver = driver
  }

  /**
   * Replace a disk with an isolated memory driver.
   *
   * @param app - Application with `storage` bound.
   * @param disk - Disk name (default disk when omitted).
   * @returns Fake for assertions.
   */
  public static fake(app: Application, disk?: string): StorageFake {
    const manager = app.make<StorageManager>('storage')
    const name = disk ?? manager.getDefaultDiskKey()
    const driver = new MemoryDriver()
    const next = manager.replaceDisk(name, driver)
    const previous = manager
    app.container.instance('storage', next)
    const fake = new StorageFake(driver)
    onTestingCleanup(() => {
      app.container.instance('storage', previous)
    })
    return fake
  }

  /**
   * Assert a file exists on the fake disk.
   *
   * @param path - Relative path.
   */
  public async assertExists(path: string): Promise<void> {
    if (!(await this.driver.exists(path))) {
      throw new AssertionError({ message: `Expected path "${path}" to exist.` })
    }
  }

  /**
   * Assert a file is missing.
   *
   * @param path - Relative path.
   */
  public async assertMissing(path: string): Promise<void> {
    if (await this.driver.exists(path)) {
      throw new AssertionError({ message: `Expected path "${path}" to be missing.` })
    }
  }

  /**
   * Assert file count under a directory prefix (non-recursive file list).
   *
   * @param directory - Directory prefix.
   * @param count - Expected count from {@link MemoryDriver.files}.
   */
  public async assertCount(directory: string, count: number): Promise<void> {
    const files = await this.driver.files(directory)
    if (files.length !== count) {
      throw new AssertionError({
        message: `Expected ${String(count)} file(s) under "${directory}", got ${String(files.length)}.`,
      })
    }
  }

  /**
   * Assert total stored file keys (all prefixes).
   *
   * @param count - Expected number of files.
   */
  public async assertTotalCount(count: number): Promise<void> {
    const files = await this.driver.allFiles('')
    if (files.length !== count) {
      throw new AssertionError({
        message: `Expected ${String(count)} file(s) total, got ${String(files.length)}.`,
      })
    }
  }

  /**
   * Assert a directory exists (has child entries or explicit empty dir).
   *
   * @param path - Directory path.
   */
  public async assertDirectoryExists(path: string): Promise<void> {
    const dirs = await this.driver.directories('')
    const norm = path.replace(/\/+$/, '')
    if (!dirs.includes(norm) && !(await this.driver.exists(`${norm}/.keep`))) {
      const all = await this.driver.allFiles('')
      const hasChild = all.some((f: string) => f.startsWith(`${norm}/`))
      if (!hasChild) {
        throw new AssertionError({ message: `Expected directory "${path}" to exist.` })
      }
    }
  }

  /**
   * Assert no files exist under a directory prefix.
   *
   * @param path - Directory path.
   */
  public async assertDirectoryMissing(path: string): Promise<void> {
    const all = await this.driver.allFiles('')
    const norm = path.replace(/\/+$/, '')
    if (all.some((f: string) => f === norm || f.startsWith(`${norm}/`))) {
      throw new AssertionError({ message: `Expected directory "${path}" to have no files.` })
    }
  }

  /**
   * All stored paths.
   *
   * @returns Relative paths.
   */
  public async allFiles(): Promise<string[]> {
    return await this.driver.allFiles('')
  }

  /**
   * Clear memory driver contents.
   */
  public async flush(): Promise<void> {
    const keys = await this.driver.allFiles('')
    for (const k of keys) {
      await this.driver.delete(k)
    }
  }
}
