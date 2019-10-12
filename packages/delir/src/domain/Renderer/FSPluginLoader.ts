import fs from 'fs-extra'
import _ from 'lodash'
import path from 'path'
import semver from 'semver'

import { PluginBase, version as engineVersion } from '@delirvfx/core'
import { DelirPluginPackageJson, PluginEntry } from '@delirvfx/core/src/PluginSupport/types'

import PluginScriptLoader from './PluginScriptLoader'

export default class FSPluginLoader {
  /**
   * Load packages from packages directory
   * @param {string} packageDir
   */
  public static async loadPackageDir(
    packageDir: string,
  ): Promise<{
    loaded: PluginEntry[]
    failed: { package: string; reason: string }[]
  }> {
    const entries = await Promise.all(
      (await fs.readdir(packageDir)).map(async entry => {
        const dirname = path.join(packageDir, entry)
        const stat = await fs.stat(dirname)
        return { dirname, stat }
      }),
    )

    const dirs = entries.filter(entry => entry.stat.isDirectory()).map(entry => entry.dirname)

    const packages: { [packageName: string]: PluginEntry } = {}
    const failedPackages: {
      package: string
      reason: string
      error: Error
    }[] = []

    await Promise.all(
      dirs.map(async dir => {
        try {
          const packageInfo = await this.loadPackage(dir)

          if (packages[packageInfo.id]) {
            throw new Error(`Duplicate plugin ${packageInfo.id}`)
          }

          packages[packageInfo.id] = packageInfo
        } catch (e) {
          failedPackages.push({
            package: dir,
            reason: e.message,
            error: e,
          })
        }
      }),
    )

    return {
      loaded: _.values(packages),
      failed: failedPackages,
    }
  }

  public static async loadPackage(dirPath: string): Promise<PluginEntry> {
    const packageRoot = dirPath
    const content = (await fs.readFile(path.join(packageRoot, 'package.json'))).toString()
    const json: DelirPluginPackageJson = JSON.parse(content)
    const entryPath = json.main ? path.join(packageRoot, json.main) : path.join(packageRoot, 'index.js')

    // const validate = validatePluginPackageJSON(json)
    // if (!validate.valid) {
    //     throw new PluginLoadFailException(`Invalid package.json for \`${json.name}\` (${validate.errors[0]}${validate.errors[1] ? '. and more...' : ''})`)
    // }

    const requiredEngineVersion = (json.engines['@delirvfx/core'] || json.engines['delir-core'])!
    if (!semver.satisfies(engineVersion, requiredEngineVersion)) {
      throw new Error(`Plugin \`${json.name}\` not compatible to current @delirvfx/core version`)
    }

    const exports = PluginScriptLoader.load(entryPath)
    let pluginClass: typeof PluginBase

    // resolve esModule exposing
    if (exports.default) {
      pluginClass = exports.default
    } else {
      pluginClass = exports
    }

    return {
      id: json.name,
      type: json.delir.type,
      packageJson: json,
      class: pluginClass,
    }
  }
}
