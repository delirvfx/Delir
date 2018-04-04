import * as DelirCoreWebpackConfig from './packages/delir-core/webpack.config'
import * as DelirWebpackConfig from './packages/delir/webpack.config'
import * as FleurWebpackConfig from './packages/fleur/webpack.config'

module.exports = [DelirWebpackConfig, DelirCoreWebpackConfig, FleurWebpackConfig]
