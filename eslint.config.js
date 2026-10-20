const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

// Rules for the TypeScript plugin must sit in the same config object that registers it.
const withTsRules = expoConfig.map((config) =>
  config.plugins?.['@typescript-eslint']
    ? { ...config, rules: { ...config.rules, '@typescript-eslint/no-explicit-any': 'error' } }
    : config,
)

module.exports = defineConfig([
  withTsRules,
  {
    ignores: ['dist/*', 'ios/*', 'android/*', 'api/*', 'postman/*', 'supabase/functions/*'],
  },
  {
    rules: {
      'no-console': 'error',
    },
  },
])
