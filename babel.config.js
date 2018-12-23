module.exports = {
    presets: [
        [
            '@babel/env',
            {
                modules: false,
                targets: {
                    node: true,
                },
            },
        ],
    ],
    plugins: [
        '@babel/plugin-transform-modules-commonjs',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',
    ],
}
