import fs from 'fs-promise'
import {join} from 'path'
import * as Validators from '../../src/services/validators'

describe('Standard plugins package.json format check', () => {
    const pluginsRoot = join(__dirname, '../../src/plugins/')

    it('audio-layer', async () => {
        Validators.delirPackageJson(require(join(pluginsRoot, 'audio-layer/package.json')))
    })

    it('composition-layer', async () => {
        Validators.delirPackageJson(require(join(pluginsRoot, 'composition-layer/package.json')))
    })

    it('scripting-layer', async () => {
        Validators.delirPackageJson(require(join(pluginsRoot, 'scripting-layer/package.json')))
    })
})
