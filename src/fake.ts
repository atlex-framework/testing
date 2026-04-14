import { allFakers, faker as fakerEn } from '@faker-js/faker'
import type { Faker } from '@faker-js/faker'

import { AtlexFaker } from './atlexFaker.js'

const fakers = allFakers as Readonly<Record<string, Faker>>

function resolveFaker(locale?: string): Faker {
  if (locale === undefined || locale === '') {
    return fakerEn
  }
  const key = locale.replace(/-/g, '_')
  const instance = fakers[key]
  if (instance === undefined) {
    throw new Error(
      `fake("${locale}"): unknown locale. Use an @faker-js/faker locale key (e.g. "en_US", "de", "fr").`,
    )
  }
  return instance
}

/**
 * Returns a locale-aware fake data generator (`name()`, `unique().safeEmail()`, etc.).
 *
 * @param locale - Optional Faker.js locale (e.g. `"de"`, `"en_US"`). Omit for default English.
 */
export function fake(locale?: string): AtlexFaker {
  return new AtlexFaker(resolveFaker(locale))
}
