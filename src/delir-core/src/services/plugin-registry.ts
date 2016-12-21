import {PluginFeatures, DelirPluginPackageJson} from '../plugin/types'
import {ParameterTypeDescriptor} from '../plugin/type-descriptor'

import PluginBase from '../plugin/plugin-base'
import LayerPluginBase from '../plugin/layer-plugin-base'

import * as fs from 'fs-promise'
import * as path from 'path'
import * as _ from 'lodash'

import * as Validators from './validators'
import {PluginLoadFailException} from '../exceptions/'

interface PluginEntry {
    package: DelirPluginPackageJson
    packageRoot: string
    entryPath: string
    class: typeof PluginBase
    // parameters: TypeDescriptor
}

interface BeforeLoadEntryFragment {
    package: DelirPluginPackageJson
    packageRoot: string
    entryPath: string
    class?: typeof PluginBase
    // parameters?: TypeDescriptor
}

export default class PluginRegistry
{
    static PluginFeatures = Object.freeze({
        Effect: 'Effect',
        CustomLayer: 'CustomLayer',
        // CustomLayer: 'CustomLayer',
        ExpressionExtension: 'ExpressionExtension',
    })

    private _plugins: {
        [packageName: string]: PluginEntry
    } = {}

    /**
     * Load packages from packages directory
     * @param {string} packageDir
     */
    async loadPackageDir(packageDir: string) {
        const dirs = await fs.readdir(packageDir)

        const packages: {[packageName: string]: BeforeLoadEntryFragment} = {}
        const failedPackages: {package: string, reason: string}[] = []
        await Promise.all(dirs.map(async dir => {
            try {
                let packageRoot = path.join(packageDir, dir)
                let content = (await fs.readFile(path.join(packageRoot, 'package.json'))).toString()
                let json: DelirPluginPackageJson = JSON.parse(content)
                let entryPath = path.join(packageRoot, 'index')

                if (json.main) {
                    entryPath = path.join(packageRoot, json.main)
                }

                Validators.delirPackageJson(json)

                if (packages[json.name]) {
                    throw new PluginLoadFailException(`Duplicate plugin ${json.name}`)
                }

                packages[json.name] = {
                    package: json,
                    packageRoot,
                    entryPath,
                }
            } catch (e) {
                failedPackages.push({package: dir, reason: e.message})
            }
        }))

        _.each(packages, (packageInfo, id) => {
            try {
                // avoid webpack module resolving
                const _class = global.require(packageInfo.entryPath)

                // resolve babel's module exposing
                if (_class.__esModule && _class.default) {
                    packageInfo.class = _class.default
                } else {
                    packageInfo.class = _class
                }

                packageInfo.class!.pluginDidLoad()
                // packageInfo.parameters = packageInfo.class!.provideParameters()
                this._plugins[id!] = packageInfo as PluginEntry
            } catch (e) {
                throw new PluginLoadFailException(`Failed to requiring plugin \`${id}\`. (${e.message})`, {before: e})
            }
        })

        return {
            packages: _.cloneDeep(packages),
            failed: failedPackages,
        }
    }

    requireById(packageId: string): typeof PluginBase | null
    {
        const pluginInfo = this._plugins[packageId]
        return pluginInfo ? pluginInfo.class : null
    }

    getPluginParametersById(packageId: string): ParameterTypeDescriptor[]|null
    {
        const pluginInfo = this._plugins[packageId]

        if (pluginInfo && pluginInfo.class.prototype instanceof LayerPluginBase) {
            return (pluginInfo.class as typeof LayerPluginBase).provideParameters().properties
        }

        return null
    }

    getLoadedPluginSummaries(type: PluginFeatures | null)
    {
        let plugins

        if (type != null) {
            plugins = this.getLoadedPluginsByType(type)
        } else {
            plugins = this._plugins
        }

        return _.map(plugins, (plugin, packageName) => {
            return {
                packageName,
                packageId: packageName,
                packageInfo: _.cloneDeep(plugin.package),
                packageRoot: plugin.packageRoot,
            }
        })
    }

    getLoadedPluginsByType(type: PluginFeatures)
    {
        return _.filter(this._plugins, entry => _.get(entry, 'package.delir.feature') === type)
    }
}
