import PluginRegistry from './PluginRegistry'

describe('PluginRegistry', () => {
  it('Shold pass validation with valid package.json', () => {
    expect(
      PluginRegistry.validateEffectPluginPackageJSON({
        name: 'effect',
        version: '0.0.0',
        author: 'ragg <ragg.devpr@gmail.com>',
        main: 'index.js',
        engines: {
          '@delirvfx/core': '0.0.0',
          node: '10.0.0',
        },
        delir: {
          name: 'Effect',
          type: 'post-effect',
        },
        extraField: {},
      }),
    ).toMatchObject({ hasError: false, reason: [] })
  })

  it('Should failed validation with invalid package.json', () => {
    expect(
      PluginRegistry.validateEffectPluginPackageJSON({
        name: 'effect',
        // version: '0',
        version: '0.0.0',
        author: 'ragg <ragg.devpr@gmail.com>',
        engines: {
          '@delirvfx/core': '0.0.0',
          // '@delirvfx/core': '0.0.0.1',
        },
        delir: {
          name: 'Effect',
          // type: 'post-effect'
          type: 'post-effect-lol',
        },
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "hasError": true,
        "reason": Array [
          [ValidationError: child "delir" fails because [child "type" fails because ["type" must be one of [post-effect]]]],
        ],
      }
    `)
  })
})
