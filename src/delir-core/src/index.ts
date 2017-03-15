// @flow
import * as Project from './project/index'
import Renderer from './renderer/renderer'
import * as Services from './services'
import * as Exceptions from './exceptions'
import * as Values from './values'
import {ColorRGB, ColorRGBA} from './values'

import Type, {TypeDescriptor, AnyParameterTypeDescriptor} from './plugin/type-descriptor'
import PluginBase from './plugin/plugin-base'
import RenderRequest from './renderer/render-request'
import PluginPreRenderRequest from './renderer/plugin-pre-rendering-request'
import LayerPluginBase from './plugin/layer-plugin-base'
import EffectPluginBase from './plugin/effect-plugin-base'
import PluginRegistry from './plugin/plugin-registry'

import * as ProjectHelper from './helper/project-helper'
import * as KeyframeHelper from './helper/keyframe-helper'

export {
    // Core
    Project,
    Renderer,
    Services,
    Exceptions,

    // Value Structure
    Values,
    /** @deprecated deprecated reference */
    ColorRGB,
    /** @deprecated deprecated reference */
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
    KeyframeHelper,

    // Types
    AnyParameterTypeDescriptor,
}