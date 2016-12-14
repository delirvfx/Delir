// @flow
import Project from '../project/project'
import PluginRegistory from '../services/plugin-registory'

import * as ProjectHelper from '../helper/project-helper'

export default class EntityResolver
{
    _project: Project
    _pluginRegistory: PluginRegistory

    constructor(project: Project, pluginRegistory: PluginRegistory)
    {
        this._project = project
        this._pluginRegistory = pluginRegistory
    }

    resolveAsset(assetId: string) {
        return ProjectHelper.findAssetById(this._project, assetId)
    }

    resolveComp(compId: string) {
        return ProjectHelper.findCompositionById(this._project, compId)
    }

    resolvePlugin(pluginName: string) {
        return this._pluginRegistory.requireById(pluginName)
    }
}
