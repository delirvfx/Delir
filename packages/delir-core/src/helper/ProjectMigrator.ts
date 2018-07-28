import { ClipScheme } from '../project/scheme/clip'
import { KeyframeConfigScheme } from '../project/scheme/keyframe'
import { ProjectScheme } from '../project/scheme/project'

import * as _ from 'lodash'
import toJSON from './toJSON'

const migrate000to2017091401 = (project: ProjectScheme): ProjectScheme => {
    const transformValueSchema = (kfConf: KeyframeConfigScheme) => {
        if (!_.isObject(kfConf.value)) return
        else {
            if (_.has(kfConf.value, 'assetId')) {
                kfConf.value = { type: 'asset', value: { assetId: (kfConf.value as any).assetId } }
            } else if (!_.has(kfConf.value, '_alpha') && _.has(kfConf.value, 'red')) {
                kfConf.value = {
                    type: 'color-rgb',
                    value: {
                        red: (kfConf.value as any)._red,
                        green: (kfConf.value as any)._green,
                        blue: (kfConf.value as any)._blue,
                    }
                }
            } else if (_.has(kfConf.value, '_alpha')) {
                kfConf.value = {
                    type: 'color-rgba',
                    value: {
                        red: (kfConf.value as any)._red,
                        green: (kfConf.value as any)._green,
                        blue: (kfConf.value as any)._blue,
                        alpha: (kfConf.value as any)._alpha,
                    }
                }
            }
        }
    }

    // Update keyframe value schema (Post effect is not implemented in v0.0.0)
    for (const comp of project.compositions) {
        comp.config.backgroundColor = {
            red: (comp.config.backgroundColor as any)._red,
            green: (comp.config.backgroundColor as any)._green,
            blue: (comp.config.backgroundColor as any)._blue,
        }

        for (const layer of comp.layers) {
            for (const clip of layer.clips) {
                for (const kfName of Object.keys(clip.keyframes)) {
                    for (const kf of clip.keyframes[kfName]) {
                        transformValueSchema(kf.config)
                    }
                }
            }
        }
    }

    project.formatVersion = '2017091401'
    return project
}

export default {
    isMigratable: (project: ProjectScheme) => {
        return project.formatVersion === '0.0.0'
    },

    migrate: (project: ProjectScheme) => {
        project = toJSON(project)

        if (project.formatVersion === '0.0.0') {
            project = migrate000to2017091401(project)
        }

        if (project.formatVersion === '2017091401') {
            return project
        }

        throw new Error(`Unknown schema version ${project.formatVersion}`)
    }
}
