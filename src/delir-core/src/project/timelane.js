// @flow
import _ from 'lodash'
import ProxySet from './_proxy-set'

import type Project from './project'
import type Composition from './composition'
import Layer from './layer'

export default class TimeLane
{
    static deserialize(timelaneJson: Object, comp: Composition)
    {
        const timelane = new TimeLane
        const config = _.pick(timelaneJson.config, ['name'])
        const layers = timelaneJson.layers.map(layerJson => Layer.deserialize(layerJson))

        Object.defineProperty(timelane, 'id', timelaneJson.id)
        timelane.layers = new Set(layers)
        Object.assign(timelane.config, config)

        return timelane
    }

    id: string
    _comp: ?Composition

    layers: Set<Layer> = new Set()

    config: {
        name: ?string,
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
