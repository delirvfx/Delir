// @flow
<<<<<<< HEAD
import path from 'path'
import FSPluginLoader from '../FSPluginLoader'

describe('PluginRegistry', () => {
    it('exporting: PluginFeatures', () => {

    it('loading plugins', async () => {
        // mock missing method in mocha

        const r = new FSPluginLoader()
        const result = await r.loadPackageDir(path.join(__dirname, '../../src/plugins'))
=======
import * as path from 'path'
import FSPluginLoader from '../FSPluginLoader'

describe('PluginRegistry', () => {
    it('loading plugins', async () => {
        const r = new FSPluginLoader()
        const result = await r.loadPackageDir(path.join(__dirname, '../../../fixtures/plugins'))
>>>>>>> 7a26a5a... Fix test

        expect(result).to.have.key('loaded')
        expect(result).to.have.key('failed')

        expect(result.loaded).to.be.an('object')
        expect(result.failed).to.be.an(Array)
    })
})
