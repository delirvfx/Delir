const webpack = require('webpack')
const path = require('path')

const sourceDir = path.join(__dirname, 'src')
const distDir = path.join(__dirname, 'dist')

module.exports = {
  target: 'web',
  context: sourceDir,
  entry: {
    index: './index.ts',
  },
  output: {
    filename: '[name].js',
    path: distDir,
    libraryTarget: 'commonjs-module',
  },
  resolve: {
    extensions: ['.js', '.ts'],
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          // If you want to type checking, please set 'false' to this option.
          transpileOnly: true,
        },
      },
    ],
  },
  plugins: [new webpack.ExternalsPlugin('commonjs', ['@delirvfx/core'])],
}
