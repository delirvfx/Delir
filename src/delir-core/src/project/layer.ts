// @flow
import * as _ from 'lodash'
import Clip from './clip'
import {ClipScheme} from './scheme/clip'
import {LayerScheme} from './scheme/layer'

export default class Layer
{
    static deserialize(layerJson: LayerScheme)
    {
        const timelane = new Layer
        const config = _.pick(layerJson.config, ['name']) as LayerScheme
        const clips = layerJson.clips.map((clipJson: ClipScheme) => Clip.deserialize(clipJson))

        Object.defineProperty(timelane, 'id', {value: layerJson.id})
        timelane.clips = new Set<Clip>(clips)
        Object.assign(timelane.config, config)

        return timelane
    }

    id: string|null = null
    clips: Set<Clip> = new Set()

    config: {
        name: string|null,
    } = {
        name: null
    }

    get name(): string { return (this.config.name as string) }
    set name(name: string) { this.config.name = name }

    constructor()
    {
        Object.seal(this)
    }

    toPreBSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            clips: Array.from(this.clips.values()).map(clip => clip.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            clips: Array.from(this.clips.values()).map(clip => clip.toJSON()),
        }
    }
}
