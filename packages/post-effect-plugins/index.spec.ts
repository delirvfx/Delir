import glob from 'glob-promise'
import semver from 'semver'
import delirPackageJson from '../core/package.json'

describe('Plugins', () => {
  const coreVersion = delirPackageJson.version

  it('Check compliancy to engines version', async () => {
    const packages = await glob('./*/package.json', { cwd: __dirname })

    let hasError = false
    for (const path of packages) {
      const { name, engines } = require(path)
      const supportedVersion = engines['@delirvfx/core']
      const satis = semver.satisfies(coreVersion, supportedVersion)

      if (!satis) {
        // tslint:disable-next-line
        console.error(
          `Plugin \`${name}\` not satisfy version to @delirvfx/core@${coreVersion} (set to ${supportedVersion})`,
        )
      }

      hasError = satis != true || hasError
    }

    expect(hasError).toBe(false)
  })
})
