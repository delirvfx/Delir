const { join } = require('path')

module.exports = {
    ...require("../../jest.config"),
    moduleFileExtensions: ['ts', 'js'],
    globals: {
        'ts-jest': {
            tsConfigFile: 'tsconfig.json'
        }
    }
}
