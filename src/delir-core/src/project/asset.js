// @flow
import _ from 'lodash'

export default class Asset
{
    static deserialize(assetJson: Object)
    {
        const asset = new Asset
        const permitKeys = _.keys(asset.config)
        Object.assign(asset.config, _.pick(assetJson, permitKeys))
        return asset
    }

    config: {
        type: ?'FILE' | 'BYNARY' | 'EXTENDED',
        handler: string,
        data: Object
    } = {
        type: '',
        handler: 'default',
        data: {}
    }

    toPreBSON(): Object
    {
        return this.toJSON()
    }

    toJSON()
    {
        return Object.assign({}, this.config);
    }
}
