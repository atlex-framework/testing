import { describe, expect, it } from 'vitest'

import { MockResponse } from '../src/MockResponse.js'

describe('TestResponse', () => {
  it('asserts status and JSON path', () => {
    const res = MockResponse.toTestResponse({
      status: 201,
      body: { data: { name: 'Ada' } },
    })
    res.assertCreated().assertJsonPath('data.name', 'Ada')
  })

  it('assertJson partial match', () => {
    const res = MockResponse.toTestResponse({
      body: { a: 1, b: { c: 2 } },
    })
    res.assertJson({ a: 1 })
  })

  it('assertJsonValidationErrors', () => {
    const res = MockResponse.toTestResponse({
      status: 422,
      body: {
        error: {
          errors: { email: ['required'], name: ['required'] },
        },
      },
    })
    expect(res).toHaveValidationErrors(['email', 'name'])
  })
})
