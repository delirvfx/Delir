const mkdirp = require('mkdirp');
const { join } = require('path');
const webpack = require('webpack');

const cacheDir = join(__dirname, './tmp');
mkdirp.sync(cacheDir);

module.exports = {
  target: 'web',
  context: __dirname,
  entry: './src/index',
  output: {
    path: join(__dirname, 'lib'),
    filename: '[name].js',
    library: 'Delir',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [ /node_modules/, /\.spec\.tsx?$/, /test_lib\// ],
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: cacheDir
            }
          },
          {
            // loader: 'awesome-typescript-loader',
            loader: 'ts-loader',
            options: {
              // useCache: true,
              // cacheDirectory: cacheDir,
              // configFileName: join(__dirname, 'tsconfig.json')
              transpileOnly: true,
              configFile: join(__dirname, 'tsconfig.json'),
            }
          }
        ]
      }
    ]
  }
};
