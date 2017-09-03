// @flow
import * as _ from 'lodash'
import * as uuid from 'uuid'

import Clip from './clip'
import {ClipScheme} from './scheme/clip'
import {LayerScheme} from './scheme/layer'

import toJSON from '../helper/toJSON'

export default class Layer
{
    public static deserialize(layerJson: LayerScheme)
    {
        const layer = new Layer()

        const config = _.pick(layerJson.config, ['name'])
        const clips = layerJson.clips.map((clipJson: ClipScheme) => Clip.deserialize(clipJson))

        Object.defineProperty(layer, '_id', {value: layerJson.id || uuid.v4()})
        Object.assign(layer._config, config)
        layer.clips = clips

        return layer
    }

    private _id: string = uuid.v4()

    public clips: Clip[] = []

    private _config: {
        name: string|null,
    } = {
        name: null
    }

    get id(): string { return this._id }

    get name(): string { return (this._config.name as string) }
    set name(name: string) { this._config.name = name }

    constructor()
    {
        Object.seal(this)
    }

    public toPreBSON(): Object
    {
        return {
            id: this.id,
            config: toJSON(this._config),
            clips: Array.from(this.clips).map(clip => clip.toPreBSON()),
        }
    }

    public toJSON(): Object
    {
        return {
            id: this.id,
            config: toJSON(this._config),
            clips: Array.from(this.clips).map(clip => clip.toJSON()),
        }
    }
}
