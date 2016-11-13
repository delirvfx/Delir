// @flow
import path from 'path';
import PluginRegistory from '../../src/services/plugin-registory'

describe('PluginRegistory', () => {
    it('exporting: PluginFeatures', () => {
        expect(PluginRegistory.PluginFeatures).to.not.eql(null)
        expect(PluginRegistory.PluginFeatures).to.be.an('object')
    })

    it('loading plugins', async () => {
        const r = new PluginRegistory()
        const result = await r.loadPackageDir(path.join(__dirname, '../../src/plugins'))

        expect(result).to.not.empty()
        expect(result).to.have.key('packages')
        expect(result).to.have.key('failed')

        expect(result.packages).to.be.an('object')
        expect(result.failed).to.be.an(Array)
    })
})
