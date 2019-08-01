import { Configuration } from 'webpack'

module.exports = ({ config }: { config: Configuration }) => {
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
            modules: true,
            localIdentName: '[path][name]__[local]--[emoji:4]',
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
