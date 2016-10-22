// @flow
import _ from 'lodash'

export default class Layer
{
    static deserialize(layerJson: Object)
    {
        const layer = new Layer
        const permitConfigKeys = _.keys(layer.config)
        Object.assign(layer.config, _.pick(layerJson, permitConfigKeys))
        return layer
    }

    config: {
        renderer: ?string,
        rendererOptions: ?Object
    } = {
        renderer: null,
        rendererOptions: null,
    }

    constructor()
    {

    }

    toJson()
    {
        return this.config
    }
}
