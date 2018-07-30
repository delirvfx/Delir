// @flow
import UnknownPluginReferenceException from '../../exceptions/unknown-plugin-reference-exception'
import PluginRegistry from '../../plugin-support/plugin-registry'
import EffectPluginBase, { EffectPluginClass } from '../../plugin-support/PostEffectBase'
import Project from '../../project/project'

import * as ProjectHelper from '../../helper/project-helper'
import AssetProxy from './AssetProxy'

export default class DependencyResolver
{
    private _project: Project
    private _pluginRegistry: PluginRegistry

    constructor(project: Project, pluginRegistry: PluginRegistry)
    {
        this._project = project
        this._pluginRegistry = pluginRegistry
    }

    public resolveAsset(assetId: string): AssetProxy | null
    {
        const asset = ProjectHelper.findAssetById(this._project, assetId)
        return asset ? new AssetProxy(asset) : null
    }

    public resolveComp(compId: string)
    {
        return ProjectHelper.findCompositionById(this._project, compId)
    }

    public resolvePlugin(pluginName: string)
    {
        return this._pluginRegistry.requirePostEffectPluginById(pluginName)
    }

    public resolveEffectPlugin(pluginId: string): EffectPluginClass | null
    {
        try {
            return this._pluginRegistry.requirePostEffectPluginById(pluginId) as any
        } catch (e) {
            if (e instanceof UnknownPluginReferenceException) {
                return null
            }

            throw e
        }
    }
}
