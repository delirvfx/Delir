// @flow
import * as ProjectHelper from '../project-helper'

import Asset from '../../project/asset'
import Clip from '../../project/clip'
import Composition from '../../project/composition'
import Keyframe from '../../project/keyframe'
import Layer from '../../project/layer'
import Project from '../../project/project'

import ColorRGB from '../../values/color-rgb'

const propNotWritable = (obj, prop) => {
    return Object.getOwnPropertyDescriptor(obj, prop).writable === false
}

describe('ProjectHelper', () => {
    const baseProject = require('../../../fixtures/project/latest.delir.json')

    describe('#moveLayerOrder', () => {
        it('Should correct moving layer order', () => {
            const project = Project.deserialize(baseProject)
            const layers = project.compositions[0].layers
            const firstLayer = layers[0]

            // Move layer(idx=0) to idx=1
            ProjectHelper.moveLayerOrder(project, project.compositions[0].id, layers[0].id, 1)
            expect(layers[1].id).to.be(firstLayer.id)
        })

        it('Should throw exception if out of composition layer specified', () => {
            expect(() => {
                const project = Project.deserialize(baseProject)
                const outOfCompLayer = new Layer()
                ProjectHelper.moveLayerOrder(project, project.compositions[0].id, outOfCompLayer.id, 1)
            }).to.throwError()
        })
    })
})
