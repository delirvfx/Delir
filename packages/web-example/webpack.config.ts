import HtmlWebpackPlugin from 'html-webpack-plugin'
import { join } from 'path'
import webpack from 'webpack'

export default (): webpack.Configuration => ({
    entry: './src/index',
    output: {
        path: join(__dirname, 'public'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
            net: 'node-libs-browser/mock/net.js',
        },
    },
    module: {
        rules: [
            {
                test: /\.ts?/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            title: 'Delir web example',
            // template: 'src/index.html',
        }),
    ],
})
