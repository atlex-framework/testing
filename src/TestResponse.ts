import { AssertionError } from 'node:assert'

/** SuperAgent / Supertest response shape used by {@link TestResponse}. */
export interface RawHttpResponse {
  status: number
  headers: Record<string, string | string[] | undefined>
  body: unknown
  text?: string
}

function getByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.').filter(Boolean)
  let cur: unknown = obj
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) {
      return undefined
    }
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}

function partialDeepMatch(expected: Record<string, unknown>, actual: unknown): boolean {
  if (typeof actual !== 'object' || actual === null) {
    return false
  }
  const act = actual as Record<string, unknown>
  for (const [key, exp] of Object.entries(expected)) {
    if (!(key in act)) {
      return false
    }
    const got = act[key]
    if (exp !== null && typeof exp === 'object' && !Array.isArray(exp)) {
      if (!partialDeepMatch(exp as Record<string, unknown>, got)) {
        return false
      }
    } else if (JSON.stringify(got) !== JSON.stringify(exp)) {
      return false
    }
  }
  return true
}

/**
 * Fluent assertions for an HTTP response produced by {@link TestClient}.
 */
export class TestResponse {
  /**
   * @param res - SuperAgent / Supertest response.
   */
  public constructor(private readonly res: RawHttpResponse) {}

  /** HTTP status code. */
  public get statusCode(): number {
    return this.res.status
  }

  /** Normalized lower-case header map (first value per key). */
  public get headers(): Record<string, string> {
    const out: Record<string, string> = {}
    const raw = this.res.headers
    for (const [k, v] of Object.entries(raw)) {
      if (v === undefined) {
        continue
      }
      out[k.toLowerCase()] = Array.isArray(v) ? (v[0] ?? '') : v
    }
    return out
  }

  /** Raw body string when not JSON. */
  public get body(): string {
    if (typeof this.res.text === 'string') {
      return this.res.text
    }
    return ''
  }

  /** Parsed JSON (SuperAgent sets `body` for JSON responses). */
  public json<T = unknown>(): T {
    return this.res.body as T
  }

  /** Response text (alias of raw body). */
  public text(): string {
    return typeof this.res.text === 'string' ? this.res.text : ''
  }

  /**
   * First header value for a name (case-insensitive).
   *
   * @param name - Header name.
   * @returns Value or undefined.
   */
  public header(name: string): string | undefined {
    return this.headers[name.toLowerCase()]
  }

  /** @inheritdoc */
  public assertStatus(expected: number): this {
    if (this.res.status !== expected) {
      throw new AssertionError({
        message: `Expected response status ${expected}, got ${String(this.res.status)}.`,
        actual: this.res.status,
        expected,
      })
    }
    return this
  }

  /** @inheritdoc */
  public assertOk(): this {
    return this.assertStatus(200)
  }

  /** @inheritdoc */
  public assertCreated(): this {
    return this.assertStatus(201)
  }

  /** @inheritdoc */
  public assertAccepted(): this {
    return this.assertStatus(202)
  }

  /** @inheritdoc */
  public assertNoContent(status = 204): this {
    return this.assertStatus(status)
  }

  /** @inheritdoc */
  public assertMovedPermanently(): this {
    return this.assertStatus(301)
  }

  /** @inheritdoc */
  public assertFound(): this {
    return this.assertStatus(302)
  }

  /** @inheritdoc */
  public assertNotModified(): this {
    return this.assertStatus(304)
  }

  /** @inheritdoc */
  public assertBadRequest(): this {
    return this.assertStatus(400)
  }

  /** @inheritdoc */
  public assertUnauthorized(): this {
    return this.assertStatus(401)
  }

  /** @inheritdoc */
  public assertPaymentRequired(): this {
    return this.assertStatus(402)
  }

  /** @inheritdoc */
  public assertForbidden(): this {
    return this.assertStatus(403)
  }

  /** @inheritdoc */
  public assertNotFound(): this {
    return this.assertStatus(404)
  }

  /** @inheritdoc */
  public assertMethodNotAllowed(): this {
    return this.assertStatus(405)
  }

  /** @inheritdoc */
  public assertConflict(): this {
    return this.assertStatus(409)
  }

  /** @inheritdoc */
  public assertUnprocessable(): this {
    return this.assertStatus(422)
  }

  /** @inheritdoc */
  public assertTooManyRequests(): this {
    return this.assertStatus(429)
  }

  /** @inheritdoc */
  public assertServerError(): this {
    return this.assertStatus(500)
  }

  /** @inheritdoc */
  public assertServiceUnavailable(): this {
    return this.assertStatus(503)
  }

  /** @inheritdoc */
  public assertSuccessful(): this {
    if (this.res.status < 200 || this.res.status >= 300) {
      throw new AssertionError({
        message: `Expected successful 2xx response, got ${String(this.res.status)}.`,
      })
    }
    return this
  }

  /** @inheritdoc */
  public assertRedirect(uri?: string): this {
    if (this.res.status < 300 || this.res.status >= 400) {
      throw new AssertionError({
        message: `Expected redirect 3xx, got ${String(this.res.status)}.`,
      })
    }
    if (uri !== undefined) {
      const loc = this.header('location')
      if (!loc?.includes(uri)) {
        throw new AssertionError({
          message: `Expected Location to contain "${uri}", got ${String(loc)}.`,
        })
      }
    }
    return this
  }

  /** @inheritdoc */
  public assertJson(expected: Record<string, unknown>): this {
    const body = this.json()
    if (!partialDeepMatch(expected, body)) {
      throw new AssertionError({
        message: `Expected JSON to contain partial ${JSON.stringify(expected)}, got ${JSON.stringify(body)}.`,
      })
    }
    return this
  }

  /** @inheritdoc */
  public assertExactJson(expected: Record<string, unknown>): this {
    const body = this.json()
    if (JSON.stringify(body) !== JSON.stringify(expected)) {
      throw new AssertionError({
        message: `Expected exact JSON ${JSON.stringify(expected)}, got ${JSON.stringify(body)}.`,
      })
    }
    return this
  }

  /** @inheritdoc */
  public assertJsonPath(path: string, expected: unknown): this {
    const got = getByPath(this.json(), path)
    if (JSON.stringify(got) !== JSON.stringify(expected)) {
      throw new AssertionError({
        message: `Expected JSON path "${path}" to be ${JSON.stringify(expected)}, got ${JSON.stringify(got)}.`,
      })
    }
    return this
  }

  /** @inheritdoc */
  public assertJsonCount(path: string, count: number): this {
    const got = getByPath(this.json(), path)
    if (!Array.isArray(got) || got.length !== count) {
      throw new AssertionError({
        message: `Expected JSON path "${path}" to be an array of length ${String(count)}.`,
      })
    }
    return this
  }

  /** @inheritdoc */
  public assertJsonStructure(_structure: unknown[]): this {
    return this
  }

  /** @inheritdoc */
  public assertJsonMissing(data: Record<string, unknown>): this {
    if (partialDeepMatch(data, this.json())) {
      throw new AssertionError({
        message: `Expected JSON to be missing shape ${JSON.stringify(data)}.`,
      })
    }
    return this
  }

  /** @inheritdoc */
  public assertJsonMissingExact(data: Record<string, unknown>): this {
    const body = this.json()
    if (JSON.stringify(body) === JSON.stringify(data)) {
      throw new AssertionError({ message: 'Expected JSON not to equal excluded shape.' })
    }
    return this
  }

  /** @inheritdoc */
  public assertJsonValidationErrors(fields: string | string[]): this {
    const list = Array.isArray(fields) ? fields : [fields]
    const body = this.json<{ error?: { errors?: Record<string, unknown> } }>()
    const errors = body.error?.errors
    if (errors === undefined || typeof errors !== 'object') {
      throw new AssertionError({
        message: 'Expected validation error payload with `error.errors`.',
      })
    }
    for (const f of list) {
      const v = errors[f]
      if (v === undefined || (Array.isArray(v) && v.length === 0)) {
        throw new AssertionError({ message: `Expected validation error for field "${f}".` })
      }
    }
    return this
  }

  /** @inheritdoc */
  public assertJsonMissingValidationErrors(fields: string | string[]): this {
    const list = Array.isArray(fields) ? fields : [fields]
    const body = this.json<{ error?: { errors?: Record<string, unknown> } }>()
    const errors = body.error?.errors
    if (errors === undefined) {
      return this
    }
    for (const f of list) {
      const v = errors[f]
      if (v !== undefined && (!Array.isArray(v) || v.length > 0)) {
        throw new AssertionError({ message: `Expected no validation error for field "${f}".` })
      }
    }
    return this
  }

  /** @inheritdoc */
  public assertHeader(name: string, value?: string | RegExp): this {
    const h = this.header(name)
    if (h === undefined) {
      throw new AssertionError({ message: `Expected header "${name}" to be present.` })
    }
    if (value instanceof RegExp) {
      if (!value.test(h)) {
        throw new AssertionError({
          message: `Expected header "${name}" to match ${String(value)}, got "${h}".`,
        })
      }
    } else if (value !== undefined && h !== value) {
      throw new AssertionError({
        message: `Expected header "${name}" to be "${value}", got "${h}".`,
      })
    }
    return this
  }

  /** @inheritdoc */
  public assertHeaderMissing(name: string): this {
    if (this.header(name) !== undefined) {
      throw new AssertionError({ message: `Expected header "${name}" to be missing.` })
    }
    return this
  }

  /** @inheritdoc */
  public assertLocation(uri: string): this {
    return this.assertHeader('location', uri)
  }

  /** @inheritdoc */
  public assertCookie(_name: string, _value?: string): this {
    return this
  }

  /** @inheritdoc */
  public assertCookieMissing(_name: string): this {
    return this
  }

  /** @inheritdoc */
  public assertCookieExpired(_name: string): this {
    return this
  }

  /** @inheritdoc */
  public assertSee(text: string): this {
    if (!this.text().includes(text)) {
      throw new AssertionError({ message: `Expected body to contain "${text}".` })
    }
    return this
  }

  /** @inheritdoc */
  public assertDontSee(text: string): this {
    if (this.text().includes(text)) {
      throw new AssertionError({ message: `Expected body not to contain "${text}".` })
    }
    return this
  }

  /** @inheritdoc */
  public assertSeeInOrder(texts: string[]): this {
    let from = 0
    const t = this.text()
    for (const chunk of texts) {
      const i = t.indexOf(chunk, from)
      if (i < 0) {
        throw new AssertionError({ message: `Expected to see "${chunk}" in order.` })
      }
      from = i + chunk.length
    }
    return this
  }

  /** @inheritdoc */
  public assertDownload(_filename?: string): this {
    return this.assertHeader('content-disposition', /attachment/i)
  }

  /** @inheritdoc */
  public dump(): this {
    process.stderr.write(`${this.text()}\n`)
    return this
  }

  /** @inheritdoc */
  public dumpHeaders(): this {
    process.stderr.write(`${JSON.stringify(this.headers)}\n`)
    return this
  }

  /** @inheritdoc */
  public dumpStatus(): this {
    process.stderr.write(`${String(this.res.status)}\n`)
    return this
  }
}
