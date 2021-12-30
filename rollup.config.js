const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

module.exports = {
  input: './src/compiler.js',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'umd',
      name: 'HanScript',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
    },
  ],
  plugins: [resolve(), commonjs()],
}
