const { join } = require('path')
const baseConfig = require("../../jest.config")

module.exports = {
    ...baseConfig,
    moduleFileExtensions: [...baseConfig.moduleFileExtensions, 'tsx', 'sass'],
    transform: {
        ...baseConfig.transform,
        '.+\\.sass$': join(__dirname, 'test_lib/css-modules-require.setup.ts'),
    },
    setupFiles: [
        join(__dirname, 'test_lib/enzyme.setup.ts')
    ]
};
