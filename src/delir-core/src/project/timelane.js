// @flow
import _ from 'lodash'
import ProxySet from './_proxy-set'

import type Project from './project'
import type Composition from './composition'
import Layer from './layer'

export default class TimeLane
{
    static _layersProxySetHandler = timelane => ({
        add: (add, assets, [value: Layer]): any => {
            if (timelane._comp == null) {
                throw new Error('TimeLane must be added to Composition before add layer')
            }

            if (! value instanceof Layer) {
                throw new TypeError('timelane.layers only add to Layer object')
            }

            value._id = timelane._comp._project._generateAndReserveSymbolId()
            value._timelane = timelane

            return add.call(assets, value)
        },
        // TODO: delete, clear
    })

    static deserialize(timelaneJson: Object, comp: Composition)
    {
        const timelane = new TimeLane
        const config = _.pick(timelaneJson.config, ['name'])
        const layers = timelaneJson.layers.map(layerJson => Layer.deserialize(layerJson))

        timelane._id = timelaneJson.id
        timelane._comp = comp
        timelane.layers = new ProxySet(layers, TimeLane._layersProxySetHandler(timelane))
        Object.assign(timelane.config, config)
        return timelane
    }

    _id: string
    _comp: ?Composition

    layers: ProxySet<Layer> = new ProxySet([], TimeLane._layersProxySetHandler(this))

    config: {
        name: ?string,
    } = {
        name: null
    }

    get id(): string { return this._id }

    get name(): string { return this.config.name }
    set name(name: string) { this.config.name = name }

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
