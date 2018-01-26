const mkdirp = require("mkdirp");
const { join } = require("path");
const webpack = require("webpack");

const cacheDir = join(__dirname, "./tmp");
mkdirp.sync(cacheDir);

module.exports = {
  target: "web",
  context: __dirname,
  entry: "./src/index",
  output: {
    path: join(__dirname, "dist"),
    filename: "[name].js",
    library: "Delir",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.ts$/,
        loader: "tslint-loader",
        options: {
          typeCheck: true,
        },
      },
      {
        test: /\.ts$/,
        exclude: [ /node_module/, /\.spec\.ts$/, /test_lib\// ],
        use: [
          {
            loader: "cache-loader",
            options: {
              cacheDirectory: cacheDir
            }
          },
          {
            loader: "awesome-typescript-loader",
            options: {
              useCache: true,
              cacheDirectory: cacheDir,
              configFileName: join(__dirname, "tsconfig.json")
            }
          }
        ]
      }
    ]
  }
};
