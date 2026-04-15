# @atlex/testing

> First-class testing toolkit: HTTP client, fakes, database helpers, and assertions.

[![npm](https://img.shields.io/npm/v/@atlex/testing.svg?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@atlex/testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-7c3aed.svg?style=flat-square)](https://www.typescriptlang.org/)

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=flat-square&logo=buy-me-a-coffee)](https://buymeacoffee.com/khamazaspyan)

## Installation

```bash
npm install @atlex/testing
# or
yarn add @atlex/testing
```

## Quick Start

```typescript
import { test } from 'vitest'
import { TestClient } from '@atlex/testing'

test('can retrieve home page', async () => {
  const response = await TestClient.get('/')
  response.assertOk()
  response.assertSee('Welcome')
})

test('can create a user', async () => {
  const response = await TestClient.post('/users', {
    name: 'John Doe',
    email: 'john@example.com',
  })

  response.assertCreated()
  response.json().id // Access response body
})
```

## Features

- **TestClient**: Fluent HTTP client for API testing
- **Request Builders**: Chain methods for headers, auth, and request customization
- **Response Assertions**: Assert status codes, headers, and content
- **Fake Services**: Mock mail, queue, events, storage, notifications, cache, and logs
- **Database Helpers**: Seed databases, refresh state between tests
- **Factories**: Generate test data with minimal code
- **Time Helpers**: Freeze, travel, and manipulate time in tests
- **Custom Matchers**: Additional assertion helpers for common patterns

## TestClient: Making Requests

### HTTP Methods

```typescript
import { TestClient } from '@atlex/testing'

// GET request
const getResponse = await TestClient.get('/users')

// POST request
const postResponse = await TestClient.post('/users', {
  name: 'Jane Doe',
  email: 'jane@example.com',
})

// PUT request
const putResponse = await TestClient.put('/users/1', {
  name: 'Jane Smith',
})

// PATCH request
const patchResponse = await TestClient.patch('/users/1', {
  email: 'jane.smith@example.com',
})

// DELETE request
const deleteResponse = await TestClient.delete('/users/1')
```

### Request Customization

```typescript
import { TestClient } from '@atlex/testing'

const response = await TestClient.get('/api/users')
  .withHeaders({
    'X-Custom-Header': 'value',
    Authorization: 'Bearer token',
  })
  .withToken('auth-token')
  .actingAs(user)
  .withoutExceptionHandling()
```

### Acting As a User

```typescript
import { TestClient } from '@atlex/testing'

const user = await User.find(1)

const response = await TestClient.actingAs(user).get('/dashboard')

response.assertOk()
```

## TestResponse: Assertions

### Status Assertions

```typescript
import { TestClient } from '@atlex/testing'

const response = await TestClient.get('/users')

response.assertOk() // 200
response.assertCreated() // 201
response.assertNoContent() // 204
response.assertRedirect() // 3xx
response.assertBadRequest() // 400
response.assertUnauthorized() // 401
response.assertForbidden() // 403
response.assertNotFound() // 404
response.assertStatus(200) // Specific status
response.assertStatus(200, 201) // One of statuses
```

### Content Assertions

```typescript
const response = await TestClient.get('/users')

// Get JSON response
const json = response.json()
const users = response.json().data

// Get text response
const text = response.text()

// Access headers
const contentType = response.headers()['content-type']
```

### JSON Assertions

```typescript
const response = await TestClient.post('/users', {
  name: 'John Doe',
})

response.assertJson({
  success: true,
  data: {
    name: 'John Doe',
  },
})

response.assertJsonPath('data.name', 'John Doe')
response.assertJsonCount(10, 'data') // Count array length
```

### Content Matching

```typescript
const response = await TestClient.get('/users')

response.assertSee('John Doe') // Contains text
response.assertDontSee('Admin') // Doesn't contain text
response.assertSeeInOrder(['John', 'Doe']) // In order
response.assertSeeJson({ name: 'John' }) // Contains JSON
```

## Fakes: Mocking Services

### Mail Fake

```typescript
import { test } from 'vitest'
import { TestClient, MailFake } from '@atlex/testing'

test('sends welcome email', async () => {
  const mailFake = new MailFake()

  await TestClient.post('/register', {
    name: 'John Doe',
    email: 'john@example.com',
  })

  // Assert email was sent
  mailFake.assertSent('john@example.com', WelcomeEmail)

  // Assert email count
  mailFake.assertCount(1)

  // Get sent mails
  const mails = mailFake.sent()
})
```

### Queue Fake

```typescript
import { QueueFake } from '@atlex/testing'

test('dispatches background job', async () => {
  const queueFake = new QueueFake()

  await TestClient.post('/orders', orderData)

  // Assert job was dispatched
  queueFake.assertDispatched(ProcessOrderJob)

  // Assert with payload
  queueFake.assertDispatched(ProcessOrderJob, (job) => {
    return job.orderId === 123
  })

  // Get dispatched jobs
  const jobs = queueFake.dispatched()
})
```

### Event Fake

```typescript
import { EventFake } from '@atlex/testing'

test('fires user created event', async () => {
  const eventFake = new EventFake()

  await TestClient.post('/users', userData)

  // Assert event was fired
  eventFake.assertDispatched(UserCreated)

  // Assert with payload
  eventFake.assertDispatched(UserCreated, (event) => {
    return event.user.email === 'john@example.com'
  })
})
```

### Storage Fake

```typescript
import { StorageFake } from '@atlex/testing'

test('uploads file', async () => {
  const storageFake = new StorageFake()

  await TestClient.post('/upload', formData)

  // Assert file was stored
  storageFake.assertStored('avatars/user.jpg')

  // Assert missing
  storageFake.assertMissing('old/avatar.jpg')

  // Get stored files
  const files = storageFake.stored()
})
```

### Notification Fake

```typescript
import { NotificationFake } from '@atlex/testing'

test('sends notification', async () => {
  const notificationFake = new NotificationFake()

  const user = await User.find(1)
  await user.notify(new WelcomeNotification())

  // Assert notification sent
  notificationFake.assertSentTo(user, WelcomeNotification)

  // Assert count
  notificationFake.assertCount(1)
})
```

### Cache Fake

```typescript
import { CacheFake } from '@atlex/testing'

test('caches user data', async () => {
  const cacheFake = new CacheFake()

  await TestClient.get('/users/1')

  // Assert value was cached
  cacheFake.assertHas('user:1')

  // Get cached value
  const cached = cacheFake.get('user:1')
})
```

### Log Fake

```typescript
import { LogFake } from '@atlex/testing'

test('logs errors', async () => {
  const logFake = new LogFake()

  await TestClient.get('/invalid-route')

  // Assert log entry
  logFake.assertLogged('error', (log) => {
    return log.message.includes('Route not found')
  })
})
```

## Database Testing

### Using Test Database

```typescript
import { test } from 'vitest'
import { useDatabase, refreshDatabase } from '@atlex/testing'

test.beforeEach(async () => {
  await useDatabase('testing')
  await refreshDatabase()
})

test('can retrieve users', async () => {
  await User.create({ name: 'John Doe' })

  const response = await TestClient.get('/users')

  response.assertJson({
    data: [{ name: 'John Doe' }],
  })
})
```

### Database Seeding

```typescript
import { test } from 'vitest'
import { seed } from '@atlex/testing'

test.beforeEach(async () => {
  await seed(async (factory) => {
    // Create test data
    await factory.model(User).create({
      name: 'Admin',
      role: 'admin',
    })

    await factory.model(Post).times(5).create()
  })
})
```

## Factories: Test Data Generation

### Creating Test Data

```typescript
import { Factory } from '@atlex/testing'

// Create single model
const user = await Factory.make(User)

// Create with attributes
const user = await Factory.make(User, {
  name: 'John Doe',
  email: 'john@example.com',
})

// Create and persist
const user = await Factory.create(User)

// Create multiple
const users = await Factory.times(5).create(User)

// Chain methods
const users = await Factory.times(3).create(User, { role: 'admin' })
```

### Defining Factories

```typescript
import { Factory } from '@atlex/testing'

class UserFactory extends Factory {
  model() {
    return User
  }

  definition() {
    return {
      name: this.faker.person.fullName(),
      email: this.faker.internet.email(),
      password: 'password',
      emailVerifiedAt: new Date(),
    }
  }
}

// Use factory
const user = await UserFactory.create()

// With overrides
const admin = await UserFactory.create({ role: 'admin' })
```

## Time Helpers

### Freezing Time

```typescript
import { test } from 'vitest'
import { freezeTime, unfreezeTime, now } from '@atlex/testing'

test('handles time-based logic', () => {
  freezeTime('2024-03-15 14:30:00')

  const timestamp = now() // March 15, 2024 14:30

  unfreezeTime()
})
```

### Traveling Time

```typescript
import { travelTo, travelForward, travelBack } from '@atlex/testing'

test('schedules task', async () => {
  const scheduled = new Date('2024-03-15')

  // Travel to specific time
  travelTo('2024-03-15 10:00:00')

  // Travel forward
  travelForward('1 day')
  travelForward('2 hours')

  // Travel backward
  travelBack('30 minutes')
})
```

## Complete Example

```typescript
import { test } from 'vitest'
import {
  TestClient,
  useDatabase,
  refreshDatabase,
  Factory,
  MailFake,
  freezeTime,
  unfreezeTime,
} from '@atlex/testing'

test('user registration flow', async () => {
  await useDatabase('testing')
  await refreshDatabase()

  freezeTime('2024-03-15 10:00:00')

  const mailFake = new MailFake()

  // Register user
  const response = await TestClient.post('/register', {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
  })

  // Assert response
  response.assertCreated()
  response.assertJson({
    message: 'Registration successful',
  })

  // Assert email sent
  mailFake.assertSent('jane@example.com', VerifyEmailNotification)

  // Assert user created in database
  const user = await User.where('email', 'jane@example.com').first()
  expect(user).toBeDefined()

  unfreezeTime()
})

test('can edit user profile', async () => {
  const user = await Factory.create(User)

  const response = await TestClient.actingAs(user).put(`/users/${user.id}`, {
    name: 'Jane Doe',
    bio: 'Test bio',
  })

  response.assertOk()

  const updated = await User.find(user.id)
  expect(updated.name).toBe('Jane Doe')
})

test('requires authentication', async () => {
  const response = await TestClient.get('/dashboard')

  response.assertUnauthorized()
})

test('enforces authorization', async () => {
  const user = await Factory.create(User, { role: 'user' })
  const admin = await Factory.create(User, { role: 'admin' })

  const response = await TestClient.actingAs(user).delete(`/users/${admin.id}`)

  response.assertForbidden()
})
```

## Custom Matchers

```typescript
import { expect } from 'vitest'
import { addCustomMatchers } from '@atlex/testing'

addCustomMatchers({
  toBeValidEmail: (email: string) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return {
      pass: valid,
      message: () => `Expected ${email} to be a valid email`,
    }
  },
})

test('validates email', () => {
  expect('john@example.com').toBeValidEmail()
})
```

## API Overview

### TestClient

| Method                       | Description                |
| ---------------------------- | -------------------------- |
| `get(path)`                  | Send GET request           |
| `post(path, data)`           | Send POST request          |
| `put(path, data)`            | Send PUT request           |
| `patch(path, data)`          | Send PATCH request         |
| `delete(path)`               | Send DELETE request        |
| `actingAs(user)`             | Set authenticated user     |
| `withHeaders(headers)`       | Add request headers        |
| `withToken(token)`           | Add authorization token    |
| `withoutExceptionHandling()` | Disable exception handling |

### TestResponse

| Method                 | Description             |
| ---------------------- | ----------------------- |
| `assertStatus(code)`   | Assert HTTP status      |
| `assertOk()`           | Assert 200 OK           |
| `assertCreated()`      | Assert 201 Created      |
| `assertNoContent()`    | Assert 204 No Content   |
| `assertRedirect()`     | Assert 3xx Redirect     |
| `assertNotFound()`     | Assert 404 Not Found    |
| `assertUnauthorized()` | Assert 401 Unauthorized |
| `assertForbidden()`    | Assert 403 Forbidden    |
| `json()`               | Get JSON body           |
| `text()`               | Get text body           |
| `headers()`            | Get response headers    |

### Fakes

| Fake               | Description        |
| ------------------ | ------------------ |
| `MailFake`         | Mock mail sending  |
| `QueueFake`        | Mock job dispatch  |
| `EventFake`        | Mock events        |
| `StorageFake`      | Mock file storage  |
| `NotificationFake` | Mock notifications |
| `CacheFake`        | Mock cache         |
| `LogFake`          | Mock logging       |

### Database & Factories

| Helper                  | Description               |
| ----------------------- | ------------------------- |
| `useDatabase(name)`     | Switch test database      |
| `refreshDatabase()`     | Clear and reset database  |
| `seed(callback)`        | Seed test data            |
| `Factory.make(Model)`   | Create in-memory instance |
| `Factory.create(Model)` | Create and persist        |
| `Factory.times(n)`      | Create multiple           |

### Time

| Function                  | Description                    |
| ------------------------- | ------------------------------ |
| `freezeTime(time)`        | Freeze time at specific moment |
| `unfreezeTime()`          | Resume normal time             |
| `travelTo(time)`          | Travel to specific time        |
| `travelForward(duration)` | Move time forward              |
| `travelBack(duration)`    | Move time backward             |
| `now()`                   | Get current frozen time        |

## Documentation

For complete documentation, visit [https://atlex.dev/guide/testing](https://atlex.dev/guide/testing)

## License

## MIT

Part of [Atlex](https://atlex.dev) — A modern framework for Node.js.
