// @flow
import * as _ from 'lodash'
import Clip from './clip'
import {ClipScheme} from './scheme/clip'
import {LayerScheme} from './scheme/layer'

export default class Layer
{
    static deserialize(layerJson: LayerScheme)
    {
        const layer = new Layer
        const config = _.pick(layerJson.config, ['name']) as LayerScheme
        const clips = layerJson.clips.map((clipJson: ClipScheme) => Clip.deserialize(clipJson))

        Object.defineProperty(layer, 'id', {value: layerJson.id})
        layer.clips = clips
        Object.assign(layer.config, config)

        return layer
    }

    id: string|null = null
    clips: Clip[] = []

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
            clips: Array.from(this.clips).map(clip => clip.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            clips: Array.from(this.clips).map(clip => clip.toJSON()),
        }
    }
}
