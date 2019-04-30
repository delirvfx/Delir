module.exports = {
    rootDir: '.',
    preset: 'ts-jest',
    testRegex: 'src/.*\\.spec\\.tsx?$',
    moduleFileExtensions: ['ts', 'js'],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json',
        },
    },
}
