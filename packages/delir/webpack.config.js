const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const mkdirp = require('mkdirp');
const { join } = require('path');
const webpack = require('webpack');

const dev = process.env.NODE_ENV === 'development';
const cacheDir = join(__dirname, './tmp');
mkdirp.sync(cacheDir);

module.exports = {
  target: 'web',
  context: __dirname,
  entry: './src/main',
  devtool: dev ? 'source-map' : false,
  output: {
    path: join(__dirname, 'prebuild'),
    filename: 'main.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    modules: [
      "node_modules"
    ],
  },
  module: {
    rules: [
      // {
      //   enforce: 'pre',
      //   test: /\.tsx?$/,
      //   loader: 'tslint-loader',
      //   options: {
      //     typeCheck: true,
      //   }
      // },
      {
        test: /\.tsx?$/,
        exclude: [/node_module/, /\.spec\.ts$/, /test_lib\//],
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
              configFile: join(__dirname, 'tsconfig.json'),
              transpileOnly: true,
            }
          }
        ]
      },
      {
        test: /\.sass$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'cache-loader',
              options: {
                cacheDirectory: cacheDir
              }
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: dev
                  ? '[path][name]__[local]___[hash:base64:5]'
                  : '[hash:base64:7]'
              }
            },
            { loader: 'postcss-loader' }
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'app.css'
    }),
    new HtmlWebpackPlugin({
      alwaysWriteToDisk: true,
      title: 'Delir'
    }),
    new HtmlWebpackHarddiskPlugin(),
    new webpack.DefinePlugin({
      __DEV__: dev ? 'true' : 'false'
    }),
    new webpack.HotModuleReplacementPlugin(),
  ].concat(dev ? []　: [
    new UglifyJSPlugin({
      parallel: true,
      cache: cacheDir
    })
  ]),
  devServer: {
    contentBase: join(__dirname, 'prebuild'),
    port: 3000,
    inline: true,
    hot: true,
  }
};
