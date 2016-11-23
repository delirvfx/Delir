import Delir from '../../src/index';

describe('Check exportings', () => {
    // console.log(Delir);

    it('Delir.Project', () => {
        expect(Delir.Project).to.not.eql(null)
        expect(Delir.Project).to.be.an('function')
        expect(Delir.Project).to.not.be.an('object')
    })

    it('Delir.Renderer', () => {
        expect(Delir.Renderer).to.not.eql(null)
        expect(Delir.Renderer).to.be.an('function')
        expect(Delir.Renderer).to.not.be.an('object')
    })

    it('Delir.PluginBase', () => {
        expect(Delir.PluginBase).to.not.eql(null)
        expect(Delir.PluginBase).to.be.an('object')
        expect(Delir.PluginBase).to.not.be.an('function')
    })

    it('Delir.Exception', () => {
        expect(Delir.Exception).to.not.eql(null)
        expect(Delir.Exception).to.be.an('object')
        expect(Delir.Exception).to.not.be.an('function')
    })

    describe('Delir.PluginBase', () => {
        it('LayerPluginBase', () => {
            expect(Delir.PluginBase.LayerPluginBase).to.not.eql(null)
            expect(Delir.PluginBase.LayerPluginBase).to.be.an('function')
            expect(Delir.PluginBase.LayerPluginBase).to.not.be.an('object')
        })
    })

    describe('Delir.Exception', () => {
        it('PluginLoadFailException', () => {
            expect(Delir.Exception.PluginLoadFailException).to.not.eql(null)
            expect(Delir.Exception.PluginLoadFailException).to.be.an('function')
        })

        it('PluginAssertionFailedException', () => {
            expect(Delir.Exception.PluginAssertionFailedException).to.not.eql(null)
            expect(Delir.Exception.PluginAssertionFailedException).to.be.an('function')
        })

        it('InvalidPluginLoadedException', () => {
            expect(Delir.Exception.InvalidPluginLoadedException).to.not.eql(null)
            expect(Delir.Exception.InvalidPluginLoadedException).to.be.an('function')
        })
    })
})
