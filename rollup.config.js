import path from 'path'
import esbuild from 'rollup-plugin-esbuild'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import resolve from 'rollup-plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: path.resolve(__dirname, './index.ts'),
    output: [
      {
        dir: path.resolve(__dirname, 'esm'),
        format: 'esm',
      },
    ],
    external: ['@improbable-eng/grpc-web'],
    plugins: [
      resolve(),
      babel({
        exclude: ['node_modules/**'],
      }),
      esbuild({
        target: 'es2018',
      }),
      terser(),
    ],
  },
  {
    input: path.resolve(__dirname, './index.ts'),
    output: [
      {
        dir: path.resolve(__dirname, 'esm'),
        format: 'esm',
      },
    ],
    external: ['@improbable-eng/grpc-web'],
    plugins: [typescript()],
  },
]
