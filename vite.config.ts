import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { buffer } from 'stream/consumers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDir: 'dist',
      entryRoot: 'src',
      insertTypesEntry: true,
      pathsToAliases: false,
      tsconfigPath: 'tsconfig.app.json',
      strictOutput: true,
      exclude: ['src/tests/*']
    })
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      fileName: `[name].js`,
      formats: ['es']
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      external: ['dexie', 'path', 'buffer'],
      output: {
        preserveModules: true,
        entryFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        chunkFileNames: `[name].js`,
        globals: {
          dexie: 'Dexie',
          path: 'path',
          buffer: 'Buffer'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
