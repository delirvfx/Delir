const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const WriteAssetsWebpackPlugin = require('write-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const once = require('lodash/once');
const mkdirp = require('mkdirp');
const { join } = require('path');
const webpack = require('webpack');
const { spawn } = require('child_process');

const dev = process.env.NODE_ENV === 'development';
const cacheDir = join(__dirname, './tmp');
mkdirp.sync(cacheDir);

const runElectron = once(() => {
  spawn(
    join(__dirname, 'node_modules/.bin/electron'),
    [ join(__dirname, './electron-main-dev.js') ],
    { detached: false, stdio: 'inherit' }
  ).on('error', (e) => {
    console.error(e)
  })
})

module.exports = {
  target: 'electron-renderer',
  context: __dirname,
  entry: './src/main',
  devtool: dev ? 'source-map' : false,
  output: {
    path: join(__dirname, 'prebuild'),
    filename: 'main.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.node'],
    modules: [
      "node_modules"
    ],
    alias: {
      '@ragg/delir-core': '@ragg/delir-core/src/index.ts',
      '@ragg/fleur': '@ragg/fleur/src/index.ts',
      '@ragg/fleur-react': '@ragg/fleur-react/src/index.ts',
    }
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
            {
              loader: 'postcss-loader',
            }
          ]
        })
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
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
    new CleanWebpackPlugin(['prebuild']),
    new webpack.HotModuleReplacementPlugin(),
  ].concat(dev ? [
    new WriteAssetsWebpackPlugin({ force: true }),
    { apply: (compiler) => {
      compiler.hooks.done.tap('Electron Runner', runElectron)
    } },
  ]　: [
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
