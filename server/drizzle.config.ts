import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/infrastructure/database/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/squad_finder',
  },
  verbose: true,
  strict: true,
})
