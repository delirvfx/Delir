import {PluginEntry, PluginFeatures, PluginSummary} from './types'
import PluginBase from './plugin-base'
import {AnyParameterTypeDescriptor} from './type-descriptor'

import * as _ from 'lodash'
import LayerPluginBase from './layer-plugin-base'
import PluginAssertionFailedException from '../exceptions/plugin-assertion-failed-exception'
import PluginLoadFailException from '../exceptions/plugin-load-fail-exception'
import UnknownPluginReferenceException from '../exceptions/plugin-load-fail-exception'

export default class PluginRegister {
    private _plugins: {[packageName: string]: Readonly<PluginEntry>} = {}

    addEntries(entries: PluginEntry[])
    {
        for (let entry of entries) {
            if (this._plugins[entry.id] != null) {
                throw new PluginLoadFailException(`Duplicate plugin id ${entry.id}`)
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

        if (entry.class.prototype instanceof LayerPluginBase) {
            return (entry.class as typeof LayerPluginBase).provideParameters().properties
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
                package: _.cloneDeep(entry.package),
            }
        })
    }
}