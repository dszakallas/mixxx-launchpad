import { FlatCompat } from '@eslint/eslintrc'
import tsParser from '@typescript-eslint/parser'
import tsEslint from '@typescript-eslint/eslint-plugin'

const compat = new FlatCompat()

export default [
  ...compat.extends('prettier', 'plugin:@typescript-eslint/recommended'),
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsEslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-warning-comments': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
  {
    ignores: ['**/dist', '**/tmp', '**/node_modules', '**/.eslintcache'],
  },
]
