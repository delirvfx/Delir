
module.exports = {
    rootDir: '.',
    transform: {
        '^.+\\.tsx?$': 'ts-jest/preprocessor'
    },
    testRegex: 'src/.*\\.spec\\.tsx?$',
    moduleFileExtensions: ['ts', 'js'],
    globals: {
        'ts-jest': {
            tsConfigFile: 'tsconfig.test.json'
        }
    }
};
