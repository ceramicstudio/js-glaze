import path from 'path'
import esbuild from 'rollup-plugin-esbuild'

const cwd = process.cwd()
const { root } = path.parse(cwd)

function external(id) {
  return !id.startsWith('.') && !id.startsWith(root)
}

const input = 'src/index.ts'

const plugins = [
  esbuild({
    minify: true,
    target: 'es2020',
    tsconfig: path.join(cwd, 'tsconfig.json'),
  }),
]

export default [
  {
    external,
    input,
    output: { file: 'dist/lib.cjs', format: 'cjs', sourcemap: true },
    plugins,
  },
  {
    external,
    input,
    output: { file: 'dist/lib.mjs', format: 'esm', sourcemap: true },
    plugins,
  },
]
