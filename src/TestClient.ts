import type { Authenticatable } from '@atlex/auth'
import type { Application } from '@atlex/core'
import request from 'supertest'
import type { Test } from 'supertest'

import { TEST_AUTH_HEADER } from './helpers/testingAuthMiddleware.js'
import { TestResponse } from './TestResponse.js'

type HeaderBag = Record<string, string>

/**
 * HTTP integration test client (no TCP listen): dispatches through the Express stack.
 */
export class TestClient {
  private headers: HeaderBag = {}

  private cookies: Record<string, string> = {}

  private bearer: string | null = null

  private bearerType = 'Bearer'

  /**
   * @param app - Booted {@link Application}.
   */
  public constructor(private readonly app: Application) {}

  /**
   * Mark subsequent requests as authenticated (requires {@link createTestingAuthMiddleware}).
   *
   * @param user - Authenticatable model instance.
   * @param _guard - Reserved for future multi-guard routing.
   * @returns This client (fluent).
   */
  public actingAs(user: Authenticatable, _guard?: string): this {
    const model = user as { getAttribute?: (k: string) => unknown }
    const id = model.getAttribute?.('id')
    this.headers[TEST_AUTH_HEADER] = String(id ?? '')
    return this
  }

  /**
   * Merge default headers for subsequent requests.
   *
   * @param headers - Header map.
   * @returns This client (fluent).
   */
  public withHeaders(headers: HeaderBag): this {
    this.headers = { ...this.headers, ...headers }
    return this
  }

  /**
   * Set a single default header.
   *
   * @param key - Header name.
   * @param value - Header value.
   * @returns This client (fluent).
   */
  public withHeader(key: string, value: string): this {
    this.headers[key.toLowerCase()] = value
    return this
  }

  /**
   * Merge default cookies.
   *
   * @param cookies - Cookie map.
   * @returns This client (fluent).
   */
  public withCookies(cookies: Record<string, string>): this {
    this.cookies = { ...this.cookies, ...cookies }
    return this
  }

  /**
   * Set Authorization bearer token.
   *
   * @param token - Token value.
   * @param type - Scheme prefix (default `Bearer`).
   * @returns This client (fluent).
   */
  public withToken(token: string, type = 'Bearer'): this {
    this.bearer = token
    this.bearerType = type
    return this
  }

  /** @inheritdoc */
  public withoutExceptionHandling(): this {
    return this
  }

  /** @inheritdoc */
  public withExceptionHandling(): this {
    return this
  }

  /** @inheritdoc */
  public withoutMiddleware(_middleware?: unknown): this {
    return this
  }

  private applyDefaults(agent: Test): void {
    for (const [k, v] of Object.entries(this.headers)) {
      agent.set(k, v)
    }
    if (this.bearer !== null) {
      agent.set('Authorization', `${this.bearerType} ${this.bearer}`)
    }
    const parts = Object.entries(this.cookies).map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
    )
    if (parts.length > 0) {
      agent.set('Cookie', parts.join('; '))
    }
  }

  private async send(req: Test): Promise<TestResponse> {
    this.applyDefaults(req)
    const res = await req
    return new TestResponse(res)
  }

  /** @inheritdoc */
  public get(uri: string, headers?: HeaderBag): Promise<TestResponse> {
    const agent = request(this.app.express).get(uri)
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public post(
    uri: string,
    data?: Record<string, unknown>,
    headers?: HeaderBag,
  ): Promise<TestResponse> {
    const agent = request(this.app.express)
      .post(uri)
      .type('form')
      .send(data ?? {})
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public put(
    uri: string,
    data?: Record<string, unknown>,
    headers?: HeaderBag,
  ): Promise<TestResponse> {
    const agent = request(this.app.express)
      .put(uri)
      .type('form')
      .send(data ?? {})
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public patch(
    uri: string,
    data?: Record<string, unknown>,
    headers?: HeaderBag,
  ): Promise<TestResponse> {
    const agent = request(this.app.express)
      .patch(uri)
      .type('form')
      .send(data ?? {})
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public delete(
    uri: string,
    data?: Record<string, unknown>,
    headers?: HeaderBag,
  ): Promise<TestResponse> {
    const agent = request(this.app.express)
      .delete(uri)
      .type('form')
      .send(data ?? {})
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public options(uri: string, headers?: HeaderBag): Promise<TestResponse> {
    const agent = request(this.app.express).options(uri)
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public head(uri: string, headers?: HeaderBag): Promise<TestResponse> {
    const agent = request(this.app.express).head(uri)
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public getJson(uri: string, headers?: HeaderBag): Promise<TestResponse> {
    const agent = request(this.app.express).get(uri).set('Accept', 'application/json')
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public postJson(
    uri: string,
    data?: Record<string, unknown>,
    headers?: HeaderBag,
  ): Promise<TestResponse> {
    const agent = request(this.app.express)
      .post(uri)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(data ?? {})
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public putJson(
    uri: string,
    data?: Record<string, unknown>,
    headers?: HeaderBag,
  ): Promise<TestResponse> {
    const agent = request(this.app.express)
      .put(uri)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(data ?? {})
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public patchJson(
    uri: string,
    data?: Record<string, unknown>,
    headers?: HeaderBag,
  ): Promise<TestResponse> {
    const agent = request(this.app.express)
      .patch(uri)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(data ?? {})
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }

  /** @inheritdoc */
  public deleteJson(
    uri: string,
    data?: Record<string, unknown>,
    headers?: HeaderBag,
  ): Promise<TestResponse> {
    const agent = request(this.app.express)
      .delete(uri)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(data ?? {})
    if (headers !== undefined) {
      for (const [k, v] of Object.entries(headers)) {
        agent.set(k, v)
      }
    }
    return this.send(agent)
  }
}

/**
 * Build a {@link TestClient} for the given booted application.
 *
 * @param app - Application with routes and middleware registered.
 * @returns Test client instance.
 */
export function createTestClient(app: Application): TestClient {
  return new TestClient(app)
}
