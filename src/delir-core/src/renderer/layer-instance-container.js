// @flow
import type CustomLayerPluginBase from '../plugin/base/custom-layer-plugin-base'
import type RenderRequest from '../render-request'

export default class LayerInstanceContainer
{
    _baseClass: Class<CustomLayerPluginBase>
    _layer: CustomLayerPluginBase

    parameters : {[propertyId: string]: Object}

    constructor(contain : Class<CustomLayerPluginBase>)
    {
        this._baseClass = contain
        this._layer = new contain

        this.parameters = Object.create(null)
        this.parameters.transform = {
            dimention: ''
        }
    }

    setParameter(patch: Object)
    {

    }

    getPresentParameters(): Object
    {
        return {}
    }

    render(req: RenderRequest)
    {

    }
}
