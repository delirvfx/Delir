// tslint:disable no-string-literal

import path from 'path'

import PluginScriptLoader from './PluginScriptLoader'

jest.mock('@delirvfx/core', () => ({ __mocked__: true }))

describe('PluginScriptLoader', () => {
  const fixturePluginPath = path.join(__dirname, './specFixtures/PostEffectPlugin.js')

  it('Should run without error', () => {
    const mod = PluginScriptLoader.load(fixturePluginPath)
    expect(mod).toMatchObject({ default: expect.any(Function) })
  })

  it('Should hook requiring `delir-core`', () => {
    const loader = new PluginScriptLoader()
    const require = loader['makeRequire'](fixturePluginPath)
    expect(require('@delirvfx/core')).toMatchObject({ __mocked__: true })
    expect(require('@ragg/delir-core')).toMatchObject({ __mocked__: true })
  })

  it('Should pass to Module.require on requiring other module', () => {
    const loader = new PluginScriptLoader()
    loader['makeModule'](fixturePluginPath)
    const require = loader['makeRequire'](fixturePluginPath)

    expect(require('fs')).toEqual(require('fs'))
  })

  it('Can use specified global variables', () => {
    expect(() => {
      PluginScriptLoader.load(path.join(__dirname, './specFixtures/globals.js'))
    }).not.toThrow()
  })
})
