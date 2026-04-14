import express from 'express'
import { describe, it } from 'vitest'

import { Application } from '@atlex/core'

import { createTestClient } from '../src/TestClient.js'

describe('TestClient', () => {
  it('performs in-process GET', async () => {
    const app = new Application()
    app.express.get('/ping', (_req, res) => {
      res.status(200).json({ ok: true })
    })
    app.boot()
    const client = createTestClient(app)
    const res = await client.getJson('/ping')
    res.assertOk().assertJsonPath('ok', true)
  })

  it('sends JSON body on postJson', async () => {
    const app = new Application()
    app.express.use(express.json())
    app.express.post('/echo', (req, res) => {
      res.status(200).json({ got: req.body })
    })
    app.boot()
    const client = createTestClient(app)
    const res = await client.postJson('/echo', { hello: 'world' })
    res.assertJsonPath('got.hello', 'world')
  })
})
