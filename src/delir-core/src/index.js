// @flow
import * as Project from './project/index'
import Renderer from './renderer/renderer'
import * as Services from './services'
import * as Exception from './exceptions/index'

import ColorRGB from './struct/color-rgb'
import ColorRGBA from './struct/color-rgba'

import Type from './plugin/type-descriptor'
import * as ProjectHelper from './helper/project-helper'
import LayerPluginBase from './plugin/layer-plugin-base'

// Core
export * as Project from './project/index'
export Renderer from './renderer/renderer'
export * as Services from './services'
export * as Exception from './exceptions/index'


// Structure
export ColorRGB from './struct/color-rgb'
export ColorRGBA from './struct/color-rgba'

// import shorthand
export Type from './plugin/type-descriptor'
export * as ProjectHelper from './helper/project-helper'
export LayerPluginBase from './plugin/layer-plugin-base'

export default {
    // Core
    Project,
    Renderer,
    Services,
    Exception,

    // Structure
    ColorRGB,
    ColorRGBA,

    // import shorthand
    Type,
    ProjectHelper,
    LayerPluginBase,
}
