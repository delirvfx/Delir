import Joi from 'joi-browser'
import _ from 'lodash'
import semver from 'semver'

import EffectPluginBase from './PostEffectBase'
import { AnyParameterTypeDescriptor } from './TypeDescriptor'
import { DelirPluginPackageJson, PluginEntry, PluginSummary } from './types'

import { PluginAssertionFailedException, PluginLoadFailException, UnknownPluginReferenceException } from '../Exceptions'

const { version: engineVersion } = require('../../package.json')

const effectPluginPackageJSONSchema = Joi.object()
  .keys({
    name: Joi.string().required(),
    version: Joi.string().required(),
    author: [Joi.string(), Joi.array().items(Joi.string())],
    main: Joi.string().optional(),
    engines: Joi.object().keys({
      '@delirvfx/core': Joi.string().required(),
    }),
    delir: Joi.object()
      .keys({
        name: Joi.string().required(),
        type: Joi.valid('post-effect'),
      })
      .strict(),
  })
  .options({ allowUnknown: true })

export default class PluginRegistry {
  public static validateEffectPluginPackageJSON(packageJSON: any) {
    const schemaInvalidity = Joi.validate(packageJSON, effectPluginPackageJSONSchema).error
    const neededVersion = packageJSON.engines['@delirvfx/core']
    const engineVersionValidity = !!semver.validRange(neededVersion)
    const engineVersionCompatible = engineVersionValidity && semver.satisfies(engineVersion, neededVersion)
    const versionValidity = !!semver.valid(packageJSON.version)
    const hasError = schemaInvalidity != null || !engineVersionCompatible || !engineVersionValidity || !versionValidity

    return {
      hasError,
      reason: ([] as any[]).concat(
        schemaInvalidity != null ? [schemaInvalidity] : [],
        !engineVersionValidity ? ["Invalid semantic version of `engines['@delirvfx/core']` field"] : [],
        engineVersionValidity && !engineVersionCompatible
          ? [
              `Plugin not compatible to current @delirvfx/core version (you expected: ${neededVersion} current: ${engineVersion})`,
            ]
          : [],
        !versionValidity ? ['Invalid semantic version of `version` fieled'] : [],
      ),
    }
  }

  private _plugins: {
    'post-effect': { [packageName: string]: Readonly<PluginEntry> }
  } = {
    'post-effect': {},
  }

  public registerPlugin(entries: PluginEntry[]) {
    for (const entry of entries) {
      // if (this._plugins[entry.id] != null) {
      //     throw new PluginLoadFailException(`Duplicate plugin id ${entry.id}`)
      // }

      const result = PluginRegistry.validateEffectPluginPackageJSON(entry.packageJson)

      if (result.hasError) {
        throw new PluginLoadFailException(`Invalid package.json for \`${entry.id}\``, {
          reason: result.reason,
        })
      }

      // entry.pluginInfo.acceptFileTypes = entry.pluginInfo.acceptFileTypes || {}
      this._plugins[entry.type][entry.id] = Object.freeze(_.cloneDeep(entry))
    }
  }

  public unregisterPlugin(id: string) {
    delete this._plugins['post-effect'][id]
  }

  /**
   * get plugin constructor class
   * @param   {string}    target plugin ID
   * @throws UnknownPluginReferenceException
   */
  public requirePostEffectPluginById(id: string): typeof EffectPluginBase {
    if (!this._plugins['post-effect'][id]) {
      throw new UnknownPluginReferenceException(`Plugin '${id}' doesn't loaded`)
    }

    return this._plugins['post-effect'][id].class as any
  }

  /**
   * get specified plugin's provided parameter list
   * @param   {string}    target plugin ID
   * @throws UnknownPluginReferenceException
   * @throws PluginAssertionFailedException
   */
  public getPostEffectParametersById(id: string): AnyParameterTypeDescriptor[] | null {
    const entry = this._plugins['post-effect'][id]

    if (!entry) {
      throw new UnknownPluginReferenceException(`Plugin ${id} doesn't loaded`)
    }

    if (entry.class.prototype instanceof EffectPluginBase) {
      return ((entry.class as any) as typeof EffectPluginBase).provideParameters().properties
    }

    throw new PluginAssertionFailedException(`plugin ${id} can't provide parameters`)
  }

  /**
   * get plugin entry
   * @param   {string}    id      target plugin ID
   * @throws UnknownPluginReferenceException
   */
  public getPlugin(id: string): Readonly<PluginEntry> {
    if (this._plugins['post-effect'][id] == null) {
      throw new UnknownPluginReferenceException(`plugin ${id} doesn't loaded`)
    }

    return this._plugins['post-effect'][id]
  }

  /**
   * get registered plugins as array
   */
  public getPostEffectPlugins(): PluginSummary[] {
    return _.map(this._plugins['post-effect'], (entry, id) => {
      return {
        id: entry.id,
        name: entry.packageJson.delir.name,
        type: entry.packageJson.delir.type,
        package: _.cloneDeep(entry.packageJson),
      }
    })
  }
}
