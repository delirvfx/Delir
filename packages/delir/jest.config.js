const { join } = require('path')

module.exports = {
    ...require('../../jest.config'),
    testRegex: '.*\\.spec\\.tsx?$',
    globals: {
        'ts-jest': {
            tsConfig: join(__dirname, 'tsconfig.test.json'),
            typeCheck: false,
        },
    },
}
