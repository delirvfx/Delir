import {} from 'jest'
import PluginRegistry, { PluginTypes } from './PluginRegistry'

describe('PluginRegistry', () => {
    let registry: PluginRegistry

    beforeEach(() => { registry = new PluginRegistry() })

    describe('#registerPlugin', () => {
        it('Register a plugin correctly', () => {
            registry.registerPlugin('@delir/example-id', {
                type: PluginTypes.postEffect,
                version: '0.0.0',
                author: '└(՞ةڼ◔)」<nuvesco@example.com>',
                factory: class {}
            })

            const plugins = Object.entries((registry as any).plugins as PluginRegistry['plugins'])
            expect(plugins).toHaveLength(1)
            expect( /* id */ plugins[0][0]).toBe('@delir/example-id')
        })

        it('Throw exception when duplicate ID registered', () => {
            registry.registerPlugin('@delir/example-id', {
                type: PluginTypes.postEffect,
                version: '0.0.0',
                author: '└(՞ةڼ◔)」<nuvesco@example.com>',
                factory: class {}
            })

            expect(() => {
                registry.registerPlugin('@delir/example-id', {
                    type: PluginTypes.postEffect,
                    version: '0.0.0',
                    author: '└(՞ةڼ◔)」<nuvesco@example.com>',
                    factory: class {}
                })
             }).toThrowError('PluginID duplicated')
        })
    })

    describe('#getPlugins', () => {
        it('Get all plugins', () => {
            registry.registerPlugin('@delir/example-id', {
                type: PluginTypes.postEffect,
                version: '0.0.0',
                author: '└(՞ةڼ◔)」<nuvesco@example.com>',
                factory: class {}
            })

            registry.registerPlugin('@delir/example-id-2', {
                type: PluginTypes.postEffect,
                version: '0.0.0',
                author: '└(՞ةڼ◔)」<nuvesco@example.com>',
                factory: class {}
            })

            const plugins = registry.getPlugins()
            expect(plugins).toHaveLength(2)
        })

        it('Get type filtered plugins', () => {
            registry.registerPlugin('@delir/example-id', {
                type: PluginTypes.postEffect,
                version: '0.0.0',
                author: '└(՞ةڼ◔)」<nuvesco@example.com>',
                factory: class {}
            })

            registry.registerPlugin('@delir/example-id-2', {
                type: '__OTHER_TYPE__' as any,
                version: '0.0.0',
                author: '└(՞ةڼ◔)」<nuvesco@example.com>',
                factory: class {}
            })

            const plugins = registry.getPlugins(PluginTypes.postEffect)
            expect(plugins).toHaveLength(1)
        })
    })

    describe('#getPluginById', () => {
        it('Find registered plugin or but', () => {
            registry.registerPlugin('@delir/example-id', {
                type: PluginTypes.postEffect,
                version: '0.0.0',
                author: '└(՞ةڼ◔)」<nuvesco@example.com>',
                factory: class {}
            })

            const plugin = registry.getPluginById('@delir/example-id', PluginTypes.postEffect)
            const nonExistsPlugin = registry.getPluginById('@delir/non-exists', PluginTypes.postEffect)

            expect(plugin).toEqual(expect.anything())
            expect(nonExistsPlugin).toBeNull()
        })
    })
})
