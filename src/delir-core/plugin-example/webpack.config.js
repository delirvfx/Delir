const webpack = require("webpack");
const path = require("path");

const sourceDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");

module.exports = {
    target: "electron",
    context: sourceDir,
    entry: {
        index: "./index.ts",
    },
    output: {
        filename: "[name].js",
        path: distDir,
        libraryTarget: "commonjs-module"
    },
    resolve: {
        extensions: [".js", ".ts"],
        modules: ["node_modules"],
    },
    externals: [
        (context, request, callback) => {
            // Resolve `delir-core` module from Delir runtime version
            if (/^delir-core/.test(request)) {
                callback(null, `require("${request}")`);
                return;
            }

            callback();
        }
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "awesome-typescript-loader",
                options: {
                    // If you want to type checking, please set 'false' to this option.
                    // But delir-core typings is very broken. TypeScript warns to delir-core's broken typing...
                    transpileOnly: true
                }
            }
        ]
    }
};
