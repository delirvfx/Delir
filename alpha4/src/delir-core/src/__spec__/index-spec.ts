import * as Delir from '../index'

describe('Check exportings', () => {
    it('Delir (with import)', () => {
        expect(Delir).to.be.an('object')
    })

    describe('Delir.Project', () => {
        it('Delir.Project', () => {
            expect(Delir.Project).to.be.an('object')
        })

        it('Delir.Project.Project', () => {
            expect(Delir.Project.Project).to.be.an('function')
        })

        it('Delir.Project.Asset', () => {
            expect(Delir.Project.Asset).to.be.an('function')
        })

        it('Delir.Project.Composition', () => {
            expect(Delir.Project.Composition).to.be.an('function')
        })

        it('Delir.Project.Layer', () => {
            expect(Delir.Project.Layer).to.be.an('function')
        })

        it('Delir.Project.Clip', () => {
            expect(Delir.Project.Clip).to.be.an('function')
        })

        it('Delir.Project.Keyframe', () => {
            expect(Delir.Project.Keyframe).to.be.an('function')
        })
    })

    describe('Delir.Exceptions', () => {
        it('Delir.Exceptions', () => {
            expect(Delir.Exceptions).to.be.an('object')
        })

        it('Delir.Exceptions.DelirException', () => {
            expect(Delir.Exceptions.DelirException).to.be.an('function')
        })

        it('Delir.Exceptions.PluginLoadFailException', () => {
            expect(Delir.Exceptions.PluginLoadFailException).to.be.an('function')
        })

        it('Delir.Exceptions.PluginAssertionFailedException', () => {
            expect(Delir.Exceptions.PluginAssertionFailedException).to.be.an('function')
        })

        it('Delir.Exceptions.InvalidPluginLoadedException', () => {
            expect(Delir.Exceptions.InvalidPluginLoadedException).to.be.an('function')
        })

        it('Delir.Exceptions.RenderingFailedException', () => {
            expect(Delir.Exceptions.RenderingFailedException).to.be.an('function')
        })
    })

    it('Delir.Engine', () => {
        expect(Delir.Engine).to.be.an('object')
    })

    it('Delir.PostEffectBase', () => {
        expect(Delir.PostEffectBase).to.be.an('function')
    })

    it('Delir.ProjectHelper', () => {
        expect(Delir.ProjectHelper).to.be.an('object')
    })

    it('Delir.Type', () => {
        expect(Delir.Type).to.be.an('function')
    })
})
