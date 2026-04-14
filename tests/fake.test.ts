import { describe, expect, it } from 'vitest'

import { fake } from '../src/fake.js'

describe('fake()', () => {
  it('generates name and safeEmail', () => {
    const f = fake()
    expect(f.name().length).toBeGreaterThan(1)
    expect(f.safeEmail()).toMatch(/@example\./)
  })

  it('unique() yields distinct emails', () => {
    const u = fake().unique()
    const a = u.safeEmail()
    const b = u.safeEmail()
    expect(a).not.toBe(b)
  })

  it('accepts locale when valid', () => {
    const f = fake('de')
    expect(f.locale()).toBe('de')
  })

  it('throws on unknown locale', () => {
    expect(() => fake('xx_YY')).toThrow(/unknown locale/)
  })

  it('exposes toFaker() for full @faker-js/faker API', () => {
    const raw = fake().toFaker()
    expect(typeof raw.person.firstName()).toBe('string')
  })
})
