import { Layer } from '../Entity'
import * as Exporter from '../Exporter'
import * as ProjectHelper from './project-helper'

describe('ProjectHelper', () => {
    const baseProject = require('../../spec/fixture/project/2017091401.delir.json')

    describe('#moveLayerOrder', () => {
        it('Should correct moving layer order', () => {
            const project = Exporter.deserializeProject(baseProject)
            const layers = project.compositions[0].layers
            const firstLayer = layers[0]

            // Move layer(idx=0) to idx=1
            ProjectHelper.moveLayerOrder(project, project.compositions[0].id, layers[0].id, 1)
            expect(layers[1].id).toBe(firstLayer.id)
        })

        it('Should throw exception if out of composition layer specified', () => {
            expect(() => {
                const project = Exporter.deserializeProject(baseProject)
                const outOfCompLayer = new Layer()
                ProjectHelper.moveLayerOrder(project, project.compositions[0].id, outOfCompLayer.id, 1)
            }).toThrowError()
        })
    })
})
