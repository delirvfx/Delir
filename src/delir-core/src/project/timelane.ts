// @flow
import * as _ from 'lodash'
import Composition from './composition'
import Layer from './layer'
import {TimelaneScheme} from './scheme/timelane'

export default class TimeLane
{
    static deserialize(timelaneJson: TimelaneScheme, comp: Composition)
    {
        const timelane = new TimeLane
        const config = _.pick(timelaneJson.config, ['name']) as TimelaneScheme
        const layers = timelaneJson.layers.map(layerJson => Layer.deserialize(layerJson))

        Object.defineProperty(timelane, 'id', {value: timelaneJson.id})
        timelane.layers = new Set<Layer>(layers)
        Object.assign(timelane.config, config)

        return timelane
    }

    id: string|null = null
    layers: Set<Layer> = new Set()

    config: {
        name: string|null,
    } = {
        name: null
    }

    get name(): string { return this.config.name }
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
            layers: Array.from(this.layers.values()).map(layer => layer.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            id: this.id,
            config: Object.assign({}, this.config),
            layers: Array.from(this.layers.values()).map(layer => layer.toJSON()),
        }
    }
}
