import { join } from 'path'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { Configuration, DefinePlugin } from 'webpack'
import webpack = require('webpack')

module.exports = ({ config }: { config: Configuration }) => {
  config.resolve!.plugins = [
    new TsconfigPathsPlugin({
      configFile: join(__dirname, '../tsconfig.json'),
    }),
  ]

  config.plugins!.push(
    new DefinePlugin({ __DEV__: true }),
    new (webpack as any).ExternalsPlugin('commonjs', ['fontmanager-redux']),
  )

  config.module!.rules.push(
    {
      test: /\.tsx?/,
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
    {
      test: /\.sass/,
      use: [
        { loader: 'style-loader' },
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[path][name]__[local]--[emoji:4]',
            },
          },
        },
        {
          loader: 'sass-loader',
          options: {
            implementation: require('sass'),
          },
        },
      ],
    },
  )
  config.resolve!.extensions!.push('.ts', '.tsx', '.sass')
  return config
}
