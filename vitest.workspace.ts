import { defineWorkspace } from 'vitest/config'
import path from 'path'

export default defineWorkspace([
  {
    extends: './client/vite.config.ts',
    test: {
      name: 'client',
      root: './client',
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['**/node_modules/**', 'dist'],
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
      exclude: ['**/node_modules/**', 'dist'],
      globals: true,
      alias: {
        '@test': path.resolve(__dirname, './server/src/test'),
        '@domain': path.resolve(__dirname, './server/src/domain'),
        '@application': path.resolve(__dirname, './server/src/application'),
        '@infrastructure': path.resolve(__dirname, './server/src/infrastructure'),
        '@interface': path.resolve(__dirname, './server/src/interface'),
        '@config': path.resolve(__dirname, './server/src/config'),
      },
    },
  },
  {
    test: {
      name: 'packages',
      root: './packages',
      environment: 'node',
      include: ['shared/src/**/*.{test,spec}.ts'],
      exclude: ['**/node_modules/**', 'dist'],
      globals: true,
    },
  },
])
