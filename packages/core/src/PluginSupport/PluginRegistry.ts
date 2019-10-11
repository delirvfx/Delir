import Joi from 'joi-browser'
import _ from 'lodash'
import semver from 'semver'

import EffectPluginBase from './PostEffectBase'
import { AnyParameterTypeDescriptor } from './TypeDescriptor'
import { DelirPluginPackageJson, PluginEntry, PluginSummary } from './types'

import PluginAssertionFailedException from '../Exceptions/PlugiinAssertionFailedException'
import PluginLoadFailException from '../Exceptions/PluginLoadFailException'
import UnknownPluginReferenceException from '../Exceptions/UnknownPluginReferenceException'

const { version: engineVersion } = require('../../package.json')

// SEE: https://gist.github.com/jhorsman/62eeea161a13b80e39f5249281e17c39
const SEMVER_REGEXP = /^([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/

const effectPluginPackageJSONSchema = Joi.object()
  .keys({
    name: Joi.string().required(),
    version: Joi.string()
      .regex(SEMVER_REGEXP)
      .required(),
    author: [Joi.string(), Joi.array().items(Joi.string())],
    main: Joi.string().optional(),
    engines: Joi.object().keys({
      'delir-core': Joi.string().regex(SEMVER_REGEXP),
      '@delirvfx/core': Joi.string()
        .regex(SEMVER_REGEXP)
        .required(),
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
  public static validateEffectPluginPackageJSON(packageJSON: any): packageJSON is DelirPluginPackageJson {
    return (
      Joi.validate(packageJSON, effectPluginPackageJSONSchema).error == null &&
      (semver.valid(packageJSON.engines['delir-core']) != null ||
        semver.valid(packageJSON.engines['@delirvfx/core']) != null) &&
      semver.valid(packageJSON.version) != null
    )
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

      // const result = validatePluginPackageJSON(entry.packageJson)

      // if (!result.valid) {
      //     throw new PluginLoadFailException(`Invalid package.json for \`${entry.id}\` (${result.errors[0]}${result.errors[1] ? '. and more...' : ''})`)
      // }

      const requiredEngineVersion =
        entry.packageJson.engines['@delirvfx/core'] || entry.packageJson.engines['delir-core']
      if (!semver.satisfies(engineVersion, requiredEngineVersion!)) {
        throw new PluginLoadFailException(`Plugin \`${entry.id}\` not compatible to current @delirvfx/core version`)
      }

      // entry.pluginInfo.acceptFileTypes = entry.pluginInfo.acceptFileTypes || {}
      this._plugins[entry.type][entry.id] = Object.freeze(_.cloneDeep(entry))
    }
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
