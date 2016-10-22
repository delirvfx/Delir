// @flow
import _ from 'lodash'
import ProxySet from './_proxy-set'

import type Project from './project'
import type Composition from './composition'
import Layer from './layer'

export default class TimeLane
{
    static deserialize(timelaneJson: Object)
    {
        const timelane = new TimeLane
        const layers = timelaneJson.layers.map(layerJson => Layer.deserialize(layerJson))
        return timelane
    }

    _id: string
    _comp: ?Composition

    layers: ProxySet<Layer> = new ProxySet([], {
        add: (add, assets, [value: Layer]): any => {
            if (this._comp == null) {
                throw new Error('TimeLane must be added to Composition before add layer')
            }

            if (! value instanceof Layer) {
                throw new TypeError('timelane.layers only add to Layer object')
            }

            value._id = this._comp._project._generateAndReserveSymbolId()
            value._project = this

            return add.call(assets, value)
        },
        // TODO: delete, clear
    })

    toPreBSON(): Object
    {
        return {
            layers: Array.from(this.layers).map(layer => layer.toPreBSON()),
        }
    }

    toJSON(): Object
    {
        return {
            layers: Array.from(this.layers).map(layer => layer.toJSON()),
        }
    }
}
