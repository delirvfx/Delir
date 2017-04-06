// @flow
import Project from '../project/project'
import PluginRegistry from '../services/plugin-registry'

import * as ProjectHelper from '../helper/project-helper'

export default class EntityResolver
{
    _project: Project
    _pluginRegistry: PluginRegistry

    constructor(project: Project, pluginRegistry: PluginRegistry)
    {
        this._project = project
        this._pluginRegistry = pluginRegistry
    }

    resolveAsset(assetId: string) {
        return ProjectHelper.findAssetById(this._project, assetId)
    }

    resolveComp(compId: string) {
        return ProjectHelper.findCompositionById(this._project, compId)
    }

    resolvePlugin(pluginName: string) {
        return this._pluginRegistry.requireById(pluginName)
    }
}
