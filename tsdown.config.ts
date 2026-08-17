import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/dev/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'node',
  dts: true,
  fixedExtension: true,
  external: ['vitest'],
});
