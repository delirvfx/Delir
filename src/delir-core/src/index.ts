// @flow
import * as Project from './project/index'
import Renderer from './renderer/renderer'
import * as Services from './services'
import * as Exceptions from './exceptions'

import ColorRGB from './struct/color-rgb'
import ColorRGBA from './struct/color-rgba'

import Type from './plugin/type-descriptor'
import * as ProjectHelper from './helper/project-helper'
import LayerPluginBase from './plugin/layer-plugin-base'

// Core
export {
    Project,
    Renderer,
    Services,
    Exceptions
}

// Structure
export {
    ColorRGB,
    ColorRGBA
}

// import shorthand
export {
    Type,
    ProjectHelper,
    LayerPluginBase
}

export default {
    // Core
    Project,
    Renderer,
    Services,
    Exceptions,

    // Structure
    ColorRGB,
    ColorRGBA,

    // import shorthand
    Type,
    ProjectHelper,
    LayerPluginBase,
}
