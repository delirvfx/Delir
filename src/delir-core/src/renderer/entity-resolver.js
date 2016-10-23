// @flow
import type Project from '../project/project'
import type Asset from '../project/asset'
import type Composition from '../project/composition'
import type PluginRegistory from '../services/plugin-registory'

import * as Helper from '../helper/helper';

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
        return Helper.findAssetById(this._project, assetId)
    }

    resolveComp(compId: string) {
        return Helper.findCompositionById(this._project, compId)
    }

    resolvePlugin(pluginName: string) {
        return this._pluginRegistory.requireById(pluginName)
    }
}
