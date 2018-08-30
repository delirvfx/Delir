import * as Engine from './engine'
import * as Exceptions from './exceptions'
import * as PluginSupport from './plugin-support'
import * as Project from './project/index'
import * as Values from './Values'

import PreRenderRequest from './engine/PreRenderingRequest'
import RenderRequest from './engine/RenderRequest'
import PluginBase from './plugin-support/plugin-base'
import PluginRegistry from './plugin-support/plugin-registry'
import PostEffectBase from './plugin-support/PostEffectBase'
import Type, { AnyParameterTypeDescriptor, TypeDescriptor } from './plugin-support/type-descriptor'

import * as KeyframeHelper from './helper/keyframe-helper'
import * as ProjectHelper from './helper/project-helper'
import ProjectMigrator from './helper/ProjectMigrator'

import * as Entity from './Entity'

export {
    // Core (Namaspaces)
    /** @deprecated */
    Project,
    Entity,
    Engine,
    PluginSupport,
    Exceptions,
    Values,

    // Plugins
    Type,
    TypeDescriptor,
    PluginBase,
    PostEffectBase,
    PreRenderRequest,
    RenderRequest,
    PluginRegistry,

    // import shorthand
    ProjectHelper,
    KeyframeHelper,
    ProjectMigrator,

    // Types
    AnyParameterTypeDescriptor,
}
