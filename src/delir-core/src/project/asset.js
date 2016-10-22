// @flow
import _ from 'lodash'

export default class Asset
{
    static deserialize(assetJson: Object)
    {
        const asset = new Asset
        const permitKeys = _.keys(asset._config)
        Object.assign(asset._config, _.pick(assetJson, permitKeys))
        return asset
    }

    _id: string

    _config: {
        type: ?'FILE' | 'BYNARY' | 'EXTENDED',
        handler: string,
        name: string,
        data: Object
    } = {
        type: '',
        handler: 'default',
        name: '',
        data: {}
    }

    get id(): string { return this._id }

    get name(): string { return this._config.name }
    set name(name: string) { this._config.name = name }

    get type(): any { return this._config.type }
    set type(type: string) { return this._config.type = type }

    get data(): Object { return this._config.data }


    toPreBSON(): Object
    {
        return this.toJSON()
    }

    toJSON()
    {
        return Object.assign({}, this._config);
    }
}
