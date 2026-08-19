import {defineCliConfig} from 'sanity/cli'

/**
 * Read the environment directly rather than importing ./sanity/env, which
 * asserts the values are present.
 *
 * The CLI has to run before a project exists — `sanity login`, then
 * `sanity projects create` — and an asserting import makes those first two
 * commands fail on the very variable they are being run to produce.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
  autoUpdates: false,
  /**
   * `sanity schema extract --enforce-required-fields` then
   * `sanity typegen generate` writes sanity/lib/generated.ts.
   *
   * Without the enforce flag every field comes out nullable, including the
   * ones the schema marks required, and the app ends up guarding against
   * absences that validation already prevents.
   */
  typegen: {
    path: './sanity/lib/queries.ts',
    schema: './sanity/extract.json',
    generates: './sanity/lib/generated.ts',
    overloadClientMethods: false,
  },
})
