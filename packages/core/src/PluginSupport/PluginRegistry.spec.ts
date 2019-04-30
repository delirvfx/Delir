import PluginRegistry from './plugin-registry'

describe('PluginRegistry', () => {
    it('Shold pass validation with valid package.json', () => {
        expect(
            PluginRegistry.validateEffectPluginPackageJSON({
                name: 'effect',
                version: '0.0.0',
                author: 'ragg <ragg.devpr@gmail.com>',
                main: 'index.js',
                engines: {
                    'delir-core': '0.0.0',
                    node: '10.0.0',
                },
                delir: {
                    name: 'Effect',
                    type: 'post-effect',
                },
                extraField: {},
            }),
        ).toBe(true)
    })

    it('Should failed validation with invalid package.json', () => {
        expect(
            PluginRegistry.validateEffectPluginPackageJSON({
                name: 'effect',
                // version: '0',
                version: '0.0.0',
                author: 'ragg <ragg.devpr@gmail.com>',
                engines: {
                    'delir-core': '0.0.0',
                    // 'delir-core': '0.0.0.1',
                },
                delir: {
                    name: 'Effect',
                    // type: 'post-effect'
                    type: 'post-effect-lol',
                },
            }),
        ).toBe(false)
    })
})
