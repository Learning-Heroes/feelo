// Integration tests against the LOCAL Supabase stack only (pnpm dlx supabase start).
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/supabase/tests/**/*.test.ts'],
}
