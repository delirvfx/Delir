import {} from 'jest'
import { mockNewProject } from '../../test_lib/mock'
import Delir from '../Delir'
import DocumentOperator from '../DocumentOperator'
import Engine from './Engine'
import PluginRegistry from './PluginRegistry'

describe('Engine', () => {
    let engine: Engine

    beforeEach(() => {
        const project = mockNewProject()

        const context = new Delir()
        const pluginRegistry = new PluginRegistry()
        const docOp = new DocumentOperator(context, project)
        engine = new Engine(context, docOp, pluginRegistry)
    })

    describe('#constructor', () => {
        it('new', () => { /* Run beforeEach */ })
    })
})
