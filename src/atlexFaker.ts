import type { Faker } from '@faker-js/faker'

const UNIQUE_MAX_ATTEMPTS = 1_000_000

function stableKey(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * Fluent fake-data facade over `@faker-js/faker` with a stable, test-friendly surface area.
 *
 * Use {@link fake} to obtain an instance. Use {@link unique} for values that must not repeat
 * within the same generator (e.g. `fake().unique().safeEmail()`).
 */
export class AtlexFaker {
  private readonly seen: Set<string> | null

  /**
   * @param faker - Locale-specific Faker.js instance.
   * @param seen - When set, generated values are de-duplicated by stable string key.
   */
  public constructor(
    private readonly faker: Faker,
    seen: Set<string> | null = null,
  ) {
    this.seen = seen
  }

  /**
   * @returns A child faker that wraps generators so each returned value is unique (per this instance).
   */
  public unique(): AtlexFaker {
    return new AtlexFaker(this.faker, new Set())
  }

  /**
   * Underlying `@faker-js/faker` instance for APIs not mirrored here.
   */
  public toFaker(): Faker {
    return this.faker
  }

  private w<T>(generator: () => T): T {
    if (this.seen === null) {
      return generator()
    }
    for (let attempt = 0; attempt < UNIQUE_MAX_ATTEMPTS; attempt += 1) {
      const value = generator()
      const key = stableKey(value)
      if (!this.seen.has(key)) {
        this.seen.add(key)
        return value
      }
    }
    throw new Error('fake().unique(): could not generate a unique value after many attempts.')
  }

  // --- Person ---

  public name(): string {
    return this.w(() => this.faker.person.fullName())
  }

  public firstName(): string {
    return this.w(() => this.faker.person.firstName())
  }

  public lastName(): string {
    return this.w(() => this.faker.person.lastName())
  }

  public title(): string {
    return this.w(() => this.faker.person.prefix())
  }

  public titleMale(): string {
    return this.w(() => this.faker.person.prefix('male'))
  }

  public titleFemale(): string {
    return this.w(() => this.faker.person.prefix('female'))
  }

  public suffix(): string {
    return this.w(() => this.faker.person.suffix())
  }

  public jobTitle(): string {
    return this.w(() => this.faker.person.jobTitle())
  }

  // --- Address / location ---

  public streetAddress(): string {
    return this.w(() => this.faker.location.streetAddress())
  }

  public streetName(): string {
    return this.w(() => this.faker.location.street())
  }

  public city(): string {
    return this.w(() => this.faker.location.city())
  }

  public state(): string {
    return this.w(() => this.faker.location.state())
  }

  public stateAbbr(): string {
    return this.w(() => this.faker.location.state({ abbreviated: true }))
  }

  public postcode(): string {
    return this.w(() => this.faker.location.zipCode())
  }

  public country(): string {
    return this.w(() => this.faker.location.country())
  }

  public latitude(): number {
    return this.w(() => this.faker.location.latitude())
  }

  public longitude(): number {
    return this.w(() => this.faker.location.longitude())
  }

  public address(): string {
    return this.w(
      () =>
        `${this.faker.location.streetAddress()}, ${this.faker.location.city()}, ${this.faker.location.zipCode()}`,
    )
  }

  // --- Company ---

  public company(): string {
    return this.w(() => this.faker.company.name())
  }

  public companySuffix(): string {
    return this.w(() => this.faker.company.buzzPhrase())
  }

  // --- Internet ---

  public email(): string {
    return this.w(() => this.faker.internet.email())
  }

  /** Email using reserved example domains (e.g. `example.com`). */
  public safeEmail(): string {
    return this.w(() => this.faker.internet.exampleEmail())
  }

  /** Random email using a common free-mail provider domain. */
  public freeEmail(): string {
    return this.w(() => this.faker.internet.email())
  }

  public companyEmail(): string {
    return this.w(() => {
      const domain = `${this.faker.company
        .name()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')}.test`
      return this.faker.internet.email({ provider: domain })
    })
  }

  public domainName(): string {
    return this.w(() => this.faker.internet.domainName())
  }

  public domainWord(): string {
    return this.w(() => this.faker.internet.domainWord())
  }

  public url(): string {
    return this.w(() => this.faker.internet.url())
  }

  public ipv4(): string {
    return this.w(() => this.faker.internet.ipv4())
  }

  public ipv6(): string {
    return this.w(() => this.faker.internet.ipv6())
  }

  public userName(): string {
    return this.w(() => this.faker.internet.username())
  }

  public password(): string {
    return this.w(() => this.faker.internet.password())
  }

  public macAddress(): string {
    return this.w(() => this.faker.internet.mac())
  }

  public slug(): string {
    return this.w(() => this.faker.lorem.slug())
  }

  public userAgent(): string {
    return this.w(() => this.faker.internet.userAgent())
  }

  // --- Phone ---

  public phoneNumber(): string {
    return this.w(() => this.faker.phone.number())
  }

  public e164PhoneNumber(): string {
    return this.w(() => this.faker.phone.number({ style: 'international' }))
  }

  // --- Finance ---

  public creditCardNumber(): string {
    return this.w(() => this.faker.finance.creditCardNumber())
  }

  public iban(): string {
    return this.w(() => this.faker.finance.iban())
  }

  public swiftBicNumber(): string {
    return this.w(() => this.faker.finance.bic())
  }

  // --- Date / time (ISO date strings or `Date` instances) ---

  public date(): string {
    return this.w(() => this.faker.date.past().toISOString().slice(0, 10))
  }

  public dateTime(): Date {
    return this.w(() => this.faker.date.anytime())
  }

  public dateTimeBetween(from: string | Date, to: string | Date): Date {
    return this.w(() => this.faker.date.between({ from, to }))
  }

  public dateTimeThisCentury(): Date {
    return this.w(() => this.faker.date.past({ years: 100 }))
  }

  public dateTimeThisDecade(): Date {
    return this.w(() => this.faker.date.past({ years: 10 }))
  }

  public dateTimeThisYear(): Date {
    return this.w(() => this.faker.date.past({ years: 1 }))
  }

  public dateTimeThisMonth(): Date {
    return this.w(() => this.faker.date.recent({ days: 31 }))
  }

  public time(): string {
    return this.w(() => {
      const d = this.faker.date.anytime()
      return d.toISOString().slice(11, 19)
    })
  }

  // --- Lorem / text ---

  public word(): string {
    return this.w(() => this.faker.lorem.word())
  }

  public words(count = 3, asText = true): string | string[] {
    return this.w(() => {
      const raw = this.faker.lorem.words(count)
      if (asText) {
        return raw
      }
      return raw.split(' ')
    })
  }

  public sentence(): string {
    return this.w(() => this.faker.lorem.sentence())
  }

  public paragraph(): string {
    return this.w(() => this.faker.lorem.paragraph())
  }

  public text(maxNbChars?: number): string {
    return this.w(() => {
      const s = this.faker.lorem.text()
      if (maxNbChars !== undefined && s.length > maxNbChars) {
        return s.slice(0, maxNbChars)
      }
      return s
    })
  }

  // --- Numbers ---

  public randomDigit(): number {
    return this.w(() => this.faker.number.int({ min: 0, max: 9 }))
  }

  public randomDigitNotNull(): number {
    return this.w(() => this.faker.number.int({ min: 1, max: 9 }))
  }

  public randomNumber(length?: number): number {
    return this.w(() => {
      if (length === undefined) {
        return this.faker.number.int({ min: 0, max: 999_999 })
      }
      const min = 10 ** (length - 1)
      const max = 10 ** length - 1
      return this.faker.number.int({ min, max })
    })
  }

  public numberBetween(min: number, max: number): number {
    return this.w(() => this.faker.number.int({ min, max }))
  }

  public randomFloat(nbMaxDecimals?: number, min = 0, max = 100): number {
    return this.w(() =>
      this.faker.number.float({
        min,
        max,
        fractionDigits: nbMaxDecimals ?? 2,
      }),
    )
  }

  // --- Misc ---

  public boolean(chanceOfGettingTrue = 50): boolean {
    const p = Math.min(1, Math.max(0, chanceOfGettingTrue / 100))
    return this.w(() => this.faker.datatype.boolean({ probability: p }))
  }

  public uuid(): string {
    return this.w(() => this.faker.string.uuid())
  }

  public shuffle<T>(values: readonly T[]): T[] {
    return this.w(() => [...this.faker.helpers.shuffle([...values])])
  }

  public randomElement<T>(values: readonly T[]): T {
    return this.w(() => this.faker.helpers.arrayElement([...values]))
  }

  public hexColor(): string {
    return this.w(() => this.faker.color.rgb())
  }

  public rgbCssColor(): string {
    return this.w(() => this.faker.color.rgb({ format: 'css' }))
  }

  /** Current Faker.js locale code (e.g. `en`, `de`, `en_US`). */
  public locale(): string {
    const code = this.faker.getMetadata().code
    return code ?? 'unknown'
  }

  /** Random alphanumeric string up to `max` characters. */
  public randomAscii(max = 255): string {
    return this.w(() => this.faker.string.alphanumeric({ length: max }))
  }
}
