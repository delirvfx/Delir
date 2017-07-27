// @flow
Symbol.asyncIterator = Symbol.asyncIterator || Symbol.for('asyncIterator')

import * as Project from './project/index'
import * as Engine from './engine/index'
// export {default as Pipeline} from './engine/pipeline/pipeline'
import * as Services from './services'
import * as Exceptions from './exceptions'
import * as Values from './values'
import {ColorRGB, ColorRGBA} from './values'

import Type, {TypeDescriptor, AnyParameterTypeDescriptor} from './plugin-support/type-descriptor'
import PluginBase from './plugin-support/plugin-base'
import RenderRequest from './engine/pipeline/render-request'
import PluginPreRenderRequest from './engine/pipeline/plugin-pre-rendering-request'
import EffectPluginBase from './plugin-support/effect-plugin-base'
import PluginRegistry from './plugin-support/plugin-registry'

import * as ProjectHelper from './helper/project-helper'
import * as KeyframeHelper from './helper/keyframe-helper'

export {
    // Core
    Project,
    Engine,
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
