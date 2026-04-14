/**
 * Run a seeder class inside a test.
 *
 * @param SeederClass - Seeder with `run()`.
 */
export async function seed(SeederClass?: new () => { run(): Promise<void> }): Promise<void> {
  if (SeederClass === undefined) {
    return
  }
  await new SeederClass().run()
}
