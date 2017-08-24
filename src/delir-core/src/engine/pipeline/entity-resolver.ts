// @flow
import Project from '../../project/project'
import PluginRegistry from '../../plugin-support/plugin-registry'
import EffectPluginBase from '../../plugin-support/effect-plugin-base'

import * as ProjectHelper from '../../helper/project-helper'

export default class EntityResolver
{
    private _project: Project
    private _pluginRegistry: PluginRegistry

    constructor(project: Project, pluginRegistry: PluginRegistry)
    {
        this._project = project
        this._pluginRegistry = pluginRegistry
    }

    public resolveAsset(assetId: string)
    {
        return ProjectHelper.findAssetById(this._project, assetId)
    }

    public resolveComp(compId: string)
    {
        return ProjectHelper.findCompositionById(this._project, compId)
    }

    public resolvePlugin(pluginName: string)
    {
        return this._pluginRegistry.requirePostEffectPluginById(pluginName)
    }

    public resolveEffectPlugin(pluginId: string): typeof EffectPluginBase
    {
        return this._pluginRegistry.requirePostEffectPluginById(pluginId) as any
    }
}
