import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as path from 'path'
import * as semver from 'semver'

import { PluginBase } from '@ragg/delir-core'
import * as DelirCorePackageJson from '@ragg/delir-core/package.json'
import { DelirPluginPackageJson, PluginEntry } from '@ragg/delir-core/src/PluginSupport/types'

import PluginScriptLoader from './PluginScriptLoader'

export default class FSPluginLoader
{
    /**
     * Load packages from packages directory
     * @param {string} packageDir
     */
    public async loadPackageDir(packageDir: string): Promise<{loaded: PluginEntry[], failed: {package: string, reason: string}[]}>
    {
        const entries = await Promise.all(
            (await fs.readdir(packageDir))
            .map(async entry => {
                const dirname = path.join(packageDir, entry)
                const stat = await fs.stat(dirname)
                return {dirname, stat}
            })
        )

        const dirs = entries.filter(entry => entry.stat.isDirectory()).map(entry => entry.dirname)

        const packages: {[packageName: string]: PluginEntry} = {}
        const failedPackages: {package: string, reason: string, error: Error}[] = []

        await Promise.all(dirs.map(async dir => {
            try {

                const packageRoot = dir
                const content = (await fs.readFile(path.join(packageRoot, 'package.json'))).toString()
                const json: DelirPluginPackageJson = JSON.parse(content)
                const entryPath = json.main
                    ? path.join(packageRoot, json.main)
                    : path.join(packageRoot, 'index.js')

                // const validate = validatePluginPackageJSON(json)
                // if (!validate.valid) {
                //     throw new PluginLoadFailException(`Invalid package.json for \`${json.name}\` (${validate.errors[0]}${validate.errors[1] ? '. and more...' : ''})`)
                // }

                if (packages[json.name]) {
                    throw new Error(`Duplicate plugin ${json.name}`)
                }

                if (!semver.satisfies(DelirCorePackageJson.version, json.engines['delir-core'])) {
                    throw new Error(`Plugin \`${json.name}\` not compatible to current delir-core version`)
                }

                const exports = PluginScriptLoader.load(entryPath)
                let pluginClass: typeof PluginBase

                // resolve babel's module exposing
                if (exports.default) {
                    pluginClass = exports.default
                } else {
                    pluginClass = exports
                }

                packages[json.name] = {
                    id: json.name,
                    type: json.delir.type,
                    packageJson: json,
                    class: pluginClass,
                }
            } catch (e) {
                failedPackages.push({package: dir, reason: e.message, error: e})
            }
        }))

        return {
            loaded: _.values(packages),
            failed: failedPackages,
        }
    }
}
