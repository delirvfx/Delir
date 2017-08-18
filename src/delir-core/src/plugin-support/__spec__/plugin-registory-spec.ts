// @flow
import path from 'path'
import PluginRegistry from '../plugin-registry'

describe('PluginRegistry', () => {
    it('exporting: PluginFeatures', () => {
        expect(PluginRegistry.PluginFeatures).to.not.eql(null)
        expect(PluginRegistry.PluginFeatures).to.be.an('object')
    })

    it('loading plugins', async () => {
        // mock missing method in mocha
        global.require = require

        const r = new PluginRegistry()
        const result = await r.loadPackageDir(path.join(__dirname, '../../src/plugins'))

        expect(result).to.not.empty()
        expect(result).to.have.key('packages')
        expect(result).to.have.key('failed')

        expect(result.packages).to.be.an('object')
        expect(result.failed).to.be.an(Array)

        delete global.require
    })
})
