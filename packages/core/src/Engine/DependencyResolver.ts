import { Project } from '../Entity'
import UnknownPluginReferenceException from '../Exceptions/unknown-plugin-reference-exception'
import PluginRegistry from '../PluginSupport/PluginRegistry'
import { EffectPluginClass } from '../PluginSupport/PostEffectBase'
import AssetProxy from './AssetProxy'

export default class DependencyResolver {
  private _project: Project
  private _pluginRegistry: PluginRegistry

  constructor(project: Project, pluginRegistry: PluginRegistry) {
    this._project = project
    this._pluginRegistry = pluginRegistry
  }

  public resolveAsset(assetId: string | null): AssetProxy | null {
    if (!assetId) return null

    const asset = this._project.findAsset(assetId)
    return asset ? new AssetProxy(asset) : null
  }

  public resolveComp(compId: string) {
    return this._project.findComposition(compId)
  }

  public resolvePlugin(pluginName: string) {
    return this._pluginRegistry.requirePostEffectPluginById(pluginName)
  }

  public resolveEffectPlugin(pluginId: string): EffectPluginClass | null {
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
