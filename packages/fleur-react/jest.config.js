const { join } = require('path')

module.exports = {
    ...require("../../jest.config"),
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFiles: [
        join(__dirname, 'test_lib/enzyme.setup.ts')
    ]
}
