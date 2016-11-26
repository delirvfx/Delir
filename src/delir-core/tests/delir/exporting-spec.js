import Delir from '../../src/index'
const _Delir = require('../../src/index')

describe('Check exportings', () => {
    it('Delir (with require)', () => {
        expect(_Delir).to.be.an('object')
        expect(_Delir.default).to.be.an('object')
    })

    it('Delir (with import)', () => {
        expect(Delir).to.be.an('object')
    })

    describe('Delir.Project', () => {
        it('Delir.Project', () => {
            expect(Delir.Project).to.be.an('object')
            expect(_Delir.Project).to.be.an('object')
        })

        it('Delir.Project.Project', () => {
            expect(Delir.Project.Project).to.be.an('function')
            expect(_Delir.Project.Project).to.be.an('function')
        })

        it('Delir.Project.Asset', () => {
            expect(Delir.Project.Asset).to.be.an('function')
            expect(_Delir.Project.Asset).to.be.an('function')
        })

        it('Delir.Project.Composition', () => {
            expect(Delir.Project.Composition).to.be.an('function')
            expect(_Delir.Project.Composition).to.be.an('function')
        })

        it('Delir.Project.TimeLane', () => {
            expect(Delir.Project.TimeLane).to.be.an('function')
            expect(_Delir.Project.TimeLane).to.be.an('function')
        })

        it('Delir.Project.Layer', () => {
            expect(Delir.Project.Layer).to.be.an('function')
            expect(_Delir.Project.Layer).to.be.an('function')
        })

        it('Delir.Project.Keyframe', () => {
            expect(Delir.Project.Keyframe).to.be.an('function')
            expect(_Delir.Project.Keyframe).to.be.an('function')
        })
    })

    describe('Delir.Exceptions', () => {
        it('Delir.Exceptions', () => {
            expect(Delir.Exceptions).to.be.an('object')
            expect(_Delir.Exceptions).to.be.an('object')
        })

        it('Delir.Exceptions.DelirException', () => {
            expect(Delir.Exceptions.DelirException).to.be.an('function')
            expect(_Delir.Exceptions.DelirException).to.be.an('function')
        })

        it('Delir.Exceptions.PluginLoadFailException', () => {
            expect(Delir.Exceptions.PluginLoadFailException).to.be.an('function')
            expect(_Delir.Exceptions.PluginLoadFailException).to.be.an('function')
        })

        it('Delir.Exceptions.PluginAssertionFailedException', () => {
            expect(Delir.Exceptions.PluginAssertionFailedException).to.be.an('function')
            expect(_Delir.Exceptions.PluginAssertionFailedException).to.be.an('function')
        })

        it('Delir.Exceptions.InvalidPluginLoadedException', () => {
            expect(Delir.Exceptions.InvalidPluginLoadedException).to.be.an('function')
            expect(_Delir.Exceptions.InvalidPluginLoadedException).to.be.an('function')
        })

        it('Delir.Exceptions.RenderingFailedException', () => {
            expect(Delir.Exceptions.RenderingFailedException).to.be.an('function')
            expect(_Delir.Exceptions.RenderingFailedException).to.be.an('function')
        })
    })

    it('Delir.Renderer', () => {
        expect(Delir.Renderer).to.be.an('function')
        expect(_Delir.Renderer).to.be.an('function')
    })

    it('Delir.LayerPluginBase', () => {
        expect(Delir.LayerPluginBase).to.be.an('function')
        expect(_Delir.LayerPluginBase).to.be.an('function')
    })

    it('Delir.ProjectHelper', () => {
        expect(Delir.ProjectHelper).to.be.an('object')
        expect(_Delir.ProjectHelper).to.be.an('object')
    })

    it('Delir.ColorRGB', () => {
        expect(Delir.ColorRGB).to.be.an('function')
        expect(_Delir.ColorRGB).to.be.an('function')
    })

    it('Delir.ColorRGBA', () => {
        expect(Delir.ColorRGBA).to.be.an('function')
        expect(_Delir.ColorRGBA).to.be.an('function')
    })

    it('Delir.Type', () => {
        expect(Delir.Type).to.be.an('function')
        expect(_Delir.Type).to.be.an('function')
    })
})
