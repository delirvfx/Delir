import {DelirPluginPackageJson, PluginEntry} from '../plugin-support/types'

import * as fs from 'fs-promise'
import * as path from 'path'
import * as _ from 'lodash'

import {validatePluginPackageJSON} from '../plugin-support/plugin-registry'
import {PluginLoadFailException} from '../exceptions/'

export default class PluginLoader
{
    /**
     * Load packages from packages directory
     * @param {string} packageDir
     */
    async loadPackageDir(packageDir: string): Promise<{loaded: PluginEntry[], failed: {package: string, reason: string}[]}>
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
                let entryPath = path.join(packageRoot, 'index')

                if (json.main) {
                    entryPath = path.join(packageRoot, json.main)
                }

                const validate = validatePluginPackageJSON(json)
                if (!validate.valid) {
                    throw new PluginLoadFailException(`Invalid package.json for \`${json.name}\` (${validate.errors[0]}${validate.errors[1] ? '. and more...' : ''})`)
                }

                if (packages[json.name]) {
                    throw new PluginLoadFailException(`Duplicate plugin ${json.name}`)
                }

                packages[json.name] = {
                    id: json.name,
                    type: json.delir.type,
                    packageJson: json,
                    pluginInfo: json.delir,
                    packageRoot,
                    entryPath,
                    class: null!, // load later
                }
            } catch (e) {
                failedPackages.push({package: dir, reason: e.message, error: e})
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
            } catch (e) {
                delete packages[packageInfo.id]
                failedPackages.push({package: packageInfo.id, reason: `Failed to requiring plugin \`${id}\`. (${e.message})`, error: e})
            }
        })

        return {
            loaded: _.values(packages),
            failed: failedPackages,
        }
    }
}
