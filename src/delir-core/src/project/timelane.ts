// @flow
import * as _ from 'lodash'
import Clip from './clip'
import {TimelaneScheme} from './scheme/timelane'

export default class TimeLane
{
    static deserialize(timelaneJson: TimelaneScheme)
    {
        const timelane = new TimeLane
        const config = _.pick(timelaneJson.config, ['name']) as TimelaneScheme
        const clips = timelaneJson.clips.map(layerJson => Clip.deserialize(layerJson))

        Object.defineProperty(timelane, 'id', {value: timelaneJson.id})
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
