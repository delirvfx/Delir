// @flow
import * as ProjectHelper from '../../src/helper/project-helper'

import Project from '../../src/project/project'
import Asset from '../../src/project/asset'
import Composition from '../../src/project/composition'
import Layer from '../../src/project/layer'
import Clip from '../../src/project/clip'
import Keyframe from '../../src/project/keyframe'

import ColorRGB from '../../src/struct/color-rgb'

const propNotWritable = (obj, prop) => {
    return Object.getOwnPropertyDescriptor(obj, prop).writable === false
}

describe('ProjectHelper specs', () => {
    let project: Project

    beforeEach(() => { project = new Project() })
})
