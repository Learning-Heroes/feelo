// Integration tests against the LOCAL Supabase stack only (npx supabase start).
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/supabase/tests/**/*.test.ts'],
}
