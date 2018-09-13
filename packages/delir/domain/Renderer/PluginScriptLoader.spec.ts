import * as path from 'path'

import PluginScriptLoader from './PluginScriptLoader'

jest.mock('@ragg/delir-core', () => ({ __mocked__: true }))

describe('PluginScriptLoader', () => {
    const fixturePluginPath = path.join(__dirname, './specFixtures/PostEffectPlugin.js')

    it('Should run without error', () => {
        const mod = PluginScriptLoader.load(fixturePluginPath)
        expect(mod).toMatchObject({ default: expect.any(Function) })
    })

    it('Should hook requiring `delir-core`', () => {
        const loader = new PluginScriptLoader()
        const require = loader.makeRequire(fixturePluginPath)
        expect(require('@ragg/delir-core')).toEqual({ __mocked__: true })
        expect(require('delir-core')).toEqual({ __mocked__: true })
    })

    it('Should pass to Module.require on requiring other module', () => {
        const loader = new PluginScriptLoader()
        loader.makeModule(fixturePluginPath)
        const _require = loader.makeRequire(fixturePluginPath)

        expect(_require('fs')).toEqual(require('fs'))
    })

    it('Can use specified global variables', () => {
        expect(() => {
            PluginScriptLoader.load(path.join(__dirname, './specFixtures/globals.js'))
        }).not.toThrow()
    })
})
