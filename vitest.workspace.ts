import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './client/vite.config.ts',
    test: {
      name: 'client',
      root: './client',
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist'],
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
    },
  },
  {
    test: {
      name: 'server',
      root: './server',
      environment: 'node',
      include: ['src/**/*.{test,spec}.ts'],
      exclude: ['node_modules', 'dist'],
      globals: true,
    },
  },
  {
    test: {
      name: 'packages',
      root: './packages',
      environment: 'node',
      include: ['**/src/**/*.{test,spec}.ts'],
      exclude: ['node_modules', 'dist'],
      globals: true,
    },
  },
])
