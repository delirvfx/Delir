import { join } from 'path'
import * as Webpack from 'webpack'

export default {
    context: join(__dirname, 'example'),
    entry: {
        'main': './main'
    },
    output: {
        path: join(__dirname, 'example/dist'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js']
    }
} as Webpack.Configuration
