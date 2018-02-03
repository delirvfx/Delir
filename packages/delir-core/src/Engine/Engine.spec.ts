import {} from 'jest'
import { mockComposition, mockProject } from '../../test_lib/mock'
import Delir from '../Delir'
import DocumentOperator from '../DocumentOperator'
import Engine from './Engine'
import PluginRegistry from './PluginRegistry'

describe('Engine', () => {
    let engine: Engine

    beforeEach(() => {
        const project = mockProject()
        project.compositions = [ mockComposition({ id: 'mock-comp' }) ]

        const context = new Delir()
        const pluginRegistry = new PluginRegistry()
        const docOp = new DocumentOperator(context, project)
        engine = new Engine(context, docOp, pluginRegistry)
    })

    describe('#constructor', () => {
        it('new', () => { /* Run beforeEach */ })
    })

    describe('#mountComponents', () => {
        it('mountComponents correctly', async () => {
            await engine.mountComponents('mock-comp')
        })

        it('should throw an error on a composition that does not exist', async () => {
            await expect(engine.mountComponents('mock-comp')).resolves.toBeUndefined()
            await expect(engine.mountComponents('not-exists')).rejects.toEqual(expect.anything())
        })
    })
})
