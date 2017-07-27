import * as _ from 'lodash'
import * as PropTypes from 'prop-types'
import * as semver from 'semver'

import checkPropTypes from '../helper/checkPropTypes'
import {PluginEntry, PluginTypes, PluginSummary, DelirPluginPackageJson} from './types'
import PluginBase from './plugin-base'
import EffectPluginBase from './effect-plugin-base'
import {AnyParameterTypeDescriptor} from './type-descriptor'

import PluginAssertionFailedException from '../exceptions/plugin-assertion-failed-exception'
import PluginLoadFailException from '../exceptions/plugin-load-fail-exception'
import UnknownPluginReferenceException from '../exceptions/plugin-load-fail-exception'

export const validatePluginPackageJSON = (packageJson: any)=> {
    return checkPropTypes({
        name: PropTypes.string.isRequired,
        version: (props, propName) => { if (!semver.valid(props[propName])) return new Error('Invalid version specified.') },
        main: PropTypes.string,
        engines: PropTypes.shape({
            delir: (props, propName) => { if (!semver.valid(props[propName])) return new Error('Invalid engines.delir version specified.') },
        }),
        delir: PropTypes.shape({
            type: PropTypes.oneOf(['post-effect']),
            acceptFileTypes: (props, propName) => { if (!_.values(props[propName]).every(v => typeof v === 'string')) throw new Error('Invalid file type handler definition.') },
        }).isRequired
    }, packageJson, packageJson.name)
}

export default class PluginRegister {
    private _plugins: {[packageName: string]: Readonly<PluginEntry>} = {}

    addEntries(entries: PluginEntry[])
    {
        for (let entry of entries) {
            if (this._plugins[entry.id] != null) {
                throw new PluginLoadFailException(`Duplicate plugin id ${entry.id}`)
            }

            const result = validatePluginPackageJSON(entry.packageJson)
            if (!result.valid) {
                throw new PluginLoadFailException(`Invalid package.json for \`${entry.id}\` (${result.errors[0]}${result.errors[1] ? '. and more...' : ''})`)
            }

            entry.pluginInfo.acceptFileTypes = entry.pluginInfo.acceptFileTypes || {}
            this._plugins[entry.id] = Object.freeze(entry)
        }
    }

    /**
     * get plugin constructor class
     * @param   {string}    target plugin ID
     * @throws UnknownPluginReferenceException
     */
    requireById(id: string): typeof PluginBase
    {
        if (! this._plugins[id]) {
            throw new UnknownPluginReferenceException(`Plugin '${id}' doesn't loaded`)
        }

        return this._plugins[id].class
    }

    /**
     * get specified plugin's provided parameter list
     * @param   {string}    target plugin ID
     * @throws UnknownPluginReferenceException
     * @throws PluginAssertionFailedException
     */
    getParametersById(id: string): AnyParameterTypeDescriptor[]|null
    {
        const entry = this._plugins[id]

        if (!entry) {
            throw new UnknownPluginReferenceException(`Plugin ${id} doesn't loaded`)
        }

        if (entry.class.prototype instanceof EffectPluginBase) {
            return (entry.class as typeof EffectPluginBase).provideParameters().properties
        }

        throw new PluginAssertionFailedException(`plugin ${id} can't provide parameters`)
    }

    /**
     * get plugin entry
     * @param   {string}    id      target plugin ID
     * @throws UnknownPluginReferenceException
     */
    getPlugin(id: string): Readonly<PluginEntry>
    {
        if (this._plugins[id] == null) {
            throw new UnknownPluginReferenceException(`plugin ${id} doesn't loaded`)
        }

        return this._plugins[id]
    }

    /**
     * get registered plugins as array
     */
    getPlugins(): PluginSummary[]
    {
        return _.map(this._plugins, (entry, id) => {
            return {
                id: entry.id,
                type: entry.pluginInfo.feature,
                path: entry.packageRoot,
                package: _.cloneDeep(entry.packageJson),
            }
        })
    }
}
