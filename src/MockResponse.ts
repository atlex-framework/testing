import type { RawHttpResponse } from './TestResponse.js'
import { TestResponse } from './TestResponse.js'

/**
 * Build a {@link TestResponse} from explicit parts (no HTTP round-trip).
 */
export class MockResponse {
  /**
   * @param init - Status, headers, and JSON/text body.
   */
  public static toTestResponse(init: {
    status?: number
    headers?: Record<string, string | string[] | undefined>
    body?: unknown
    text?: string
  }): TestResponse {
    const raw: RawHttpResponse = {
      status: init.status ?? 200,
      headers: init.headers ?? {},
      body: init.body ?? {},
      text: init.text,
    }
    return new TestResponse(raw)
  }
}
