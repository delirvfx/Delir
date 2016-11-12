// @flow
import _ from 'lodash'
import ProxySet from './_proxy-set'

import Project from './project'
import Timelane from './timelane'
import Layer from './layer'

export default class Composition
{
    static deserialize(compJson: Object, project: Project)
    {
        const comp = new Composition
        const config = _.pick(compJson.config, [
            'name',
            'width',
            'height',
            'framerate',
            'durationFrames',
            'samplingRate',
            'audioChannels',
        ])

        const timelanes = compJson.timelanes.map(lane => Timelane.deserialize(lane))

        Object.defineProperty(comp, 'id', {value: compJson.id})
        comp.timelanes = new Set(timelanes)
        Object.assign(comp.config, config)
        return comp
    }

    id: string

    timelanes : Set<TimeLane> = new Set

    config : {
        name: ?string,
        width: ?number,
        height: ?number,
        framerate: ?number,
        durationFrames: ?number,

        samplingRate: ?number,
        audioChannels: ?number,
    } = {
        name: null,
        width: null,
        height: null,
        framerate: null,
        durationFrames: null,

        samplingRate: null,
        audioChannels: null,
    }

    get id(): string { return this._id }

    get name(): string { return this.config.name }
    set name(name: string) { this.config.name = name }

    get width(): number { return this.config.width }
    set width(width: number) { this.config.width = width }

    get height(): number { return this.config.height }
    set height(height: number) { this.config.height = height }

    get framerate(): number { return this.config.framerate }
    set framerate(framerate: number) { this.config.framerate = framerate }

    /** @deprecated */
    get durationFrame(): any { throw new Error('composition.durationFrame is discontinuance.') }
    /** @deprecated */
    set durationFrame(durationFrames: number) { throw new Error('composition.durationFrame is discontinuance.') }

    get durationFrames(): number { return this.config.durationFrames }
    set durationFrames(durationFrames: number) { this.config.durationFrames = durationFrames }

    get samplingRate(): number { return this.config.samplingRate }
    set samplingRate(samplingRate: number) { this.config.samplingRate = samplingRate }

    get audioChannels(): number { return this.config.audioChannels }
    set audioChannels(audioChannels: number) { this.config.audioChannels = audioChannels }

    constructor()
    {
        Object.seal(this)
    }

    toPreBSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            timelanes: Array.from(this.timelanes.values()).map(timelane => timelane.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            timelanes: Array.from(this.timelanes.values()).map(timelane => timelane.toJSON()),
        }
    }
}
