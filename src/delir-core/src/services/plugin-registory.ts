// @flow
import type {DelirPluginPackageJson} from './types'
import type {TypeDescriptor} from '../plugin/type-descriptor'

import fs from 'fs-promise'
import path from 'path'
import _ from 'lodash'

import * as Validators from './validators'
import {PluginLoadFailException} from '../exceptions/'

export default class PluginRegistory
{
    static PluginFeatures = Object.freeze({
        Effect: 'Effect',
        CustomLayer: 'CustomLayer',
        // CustomLayer: 'CustomLayer',
        ExpressionExtension: 'ExpressionExtension',
    })

    _plugins: {
        [packageName: string]: {
            package: Object,
            class: Class<*>,
            parameters: TypeDescriptor,
            packageRoot: string,
            entryPath: string,
        }
    } = {}

    /**
     * Load packages from packages directory
     * @param {string} packageDir
     */
    async loadPackageDir(packageDir: string) {
        const dirs = await fs.readdir(packageDir)

        const packages = {}
        const failedPackages = []
        await Promise.all(dirs.map(async dir => {
            try {
                let packageRoot = path.join(packageDir, dir)
                let content = await fs.readFile(path.join(packageRoot, 'package.json'))
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
            this._plugins[id] = packageInfo

            try {
                // avoid webpack module resolving
                const _class = global.require(packageInfo.entryPath)

                // resolve babel's module exposing
                if (_class.__esModule && _class.default) {
                    packageInfo.class = _class.default
                } else {
                    packageInfo.class = _class
                }

                packageInfo.class.pluginDidLoad()
                packageInfo.parameters = packageInfo.class.provideParameters()
            } catch (e) {
                throw new PluginLoadFailException(`Failed to requiring plugin \`${id}\`. (${e.message})`, {before: e})
            }
        })

        return {
            packages: _.cloneDeep(packages),
            failed: failedPackages,
        }
    }

    requireById(packageId: string): ?Class<*>
    {
        const pluginInfo = this._plugins[packageId]
        return pluginInfo ? pluginInfo.class : null
    }

    getPluginParametersById(packageId: string): Array<any>
    {
        const pluginInfo = this._plugins[packageId]
        return pluginInfo ? pluginInfo.parameters.properties : null
    }

    getLoadedPluginSummaries(type: ?PluginFeatures)
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

    getLoadedPluginsByType(type: PluginFeatures) {
        return _.filter(this._plugins, entry => _.get(entry, 'package.delir.feature') === type)
    }
}
