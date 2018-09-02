import { DelirPluginPackageJson, PluginEntry } from '../../delir-core/src/plugin-support/types'

import * as fs from 'fs-promise'
import * as _ from 'lodash'
import * as path from 'path'
import * as semver from 'semver'

import * as DelirCorePackageJson from '../../delir-core/package.json'

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
                    : path.join(packageRoot, 'index')

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

                let pluginClass = global.require(entryPath)

                // resolve babel's module exposing
                if (pluginClass.__esModule && pluginClass.default) {
                    pluginClass = pluginClass.default
                } else {
                    pluginClass = pluginClass
                }

                packages[json.name] = {
                    id: json.name,
                    type: json.delir.type,
                    packageJson: json,
                    class: pluginClass, // load later
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
