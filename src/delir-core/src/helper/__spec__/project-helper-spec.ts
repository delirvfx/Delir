// @flow
import * as ProjectHelper from '../project-helper'

import Project from '../../project/project'
import Asset from '../../project/asset'
import Composition from '../../project/composition'
import Layer from '../../project/layer'
import Clip from '../../project/clip'
import Keyframe from '../../project/keyframe'

import ColorRGB from '../../values/color-rgb'

const propNotWritable = (obj, prop) => {
    return Object.getOwnPropertyDescriptor(obj, prop).writable === false
}

describe('ProjectHelper specs', () => {
    let project: Project

    beforeEach(() => { project = new Project() })
})
