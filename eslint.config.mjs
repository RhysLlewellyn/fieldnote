import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * eslint-config-next 16 ships flat configs directly. The FlatCompat wrapper
 * create-next-app scaffolds is the legacy path, and loading next/core-web-vitals
 * through it throws on a circular reference in the plugin graph.
 */
const eslintConfig = [
  ...[nextCoreWebVitals].flat(),
  ...[nextTypescript].flat(),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig
