// @flow
import * as Project from './project/index'
import Renderer from './renderer/renderer'
import * as Services from './services'
import * as Exceptions from './exceptions'

import Point2D from './values/point-2d'
import Point3D from './values/point-3d'
import Size2D from './values/size-2d'
import Size3D from './values/size-3d'
import ColorRGB from './values/color-rgb'
import ColorRGBA from './values/color-rgba'

import Type, {TypeDescriptor, AnyParameterTypeDescriptor} from './plugin/type-descriptor'
import PluginBase from './plugin/plugin-base'
import RenderRequest from './renderer/render-request'
import PluginPreRenderRequest from './renderer/plugin-pre-rendering-request'
import LayerPluginBase from './plugin/layer-plugin-base'
import EffectPluginBase from './plugin/effect-plugin-base'
import PluginRegistry from './plugin/plugin-registry'

import * as ProjectHelper from './helper/project-helper'

export const Values = {
    Point2D,
    Point3D,
    Size2D,
    Size3D,
    ColorRGB,
    ColorRGBA,
}

export {
    // Core
    Project,
    Renderer,
    Services,
    Exceptions,

    // Structure
    ColorRGB,
    ColorRGBA,

    // Plugins
    Type,
    TypeDescriptor,
    PluginBase,
    LayerPluginBase,
    EffectPluginBase,
    PluginPreRenderRequest,
    RenderRequest,
    PluginRegistry,

    // import shorthand
    ProjectHelper,

    // Types
    AnyParameterTypeDescriptor,
}