// @flow
import _ from 'lodash'

import Time from './time'

export default class Layer
{
    static deserialize(layerJson: Object)
    {
        const layer = new Layer
        const permitConfigKeys = _.keys(layer.config)
        Object.assign(layer.config, _.pick(layerJson, permitConfigKeys))
        return layer
    }

    _id: string

    config: {
        renderer: ?string,
        rendererOptions: ?Object,

        placedTime: ?Time,
    } = {
        renderer: null,
        rendererOptions: null,

        placedTime: null
    }

    get id(): string { return this._id }

    constructor()
    {

    }

    toPreBSON(): Object
    {
        return this.toJSON()
    }

    toJSON(): Object
    {
        return Object.assign({}, this.config)
    }
}
