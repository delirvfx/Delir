import { AssetScheme } from './scheme/asset'

import * as _ from 'lodash'
import * as uuid from 'uuid'

export default class Asset
{
    public static deserialize(assetJson: AssetScheme)
    {
        const asset = new Asset()

        Object.defineProperty(asset, '_id', {value: assetJson.id || uuid.v4()})
        Object.assign(asset._config, _.pick(assetJson, _.keys(asset._config)))

        return asset
    }

    private _id: string = uuid.v4()

    private _config: {
        fileType: string,
        name: string,
        path: string | null,
        data: Object | null,
    } = {
        fileType: '',
        name: '',
        path: null,
        data: null,
    }

    get id(): string { return this._id }

    get mimeType(): string { throw new Error('Asset#mimeType is abandoned') }
    set mimeType(mimeType: string) { throw new Error('Asset#mimeType is abandoned') }

    /**
     * Asset file extension (without `.` prefix)
     * @property {string} fileType
     */
    get fileType(): string { return this._config.fileType.toLowerCase() }
    set fileType(fileType: string) { this._config.fileType = fileType.toLowerCase() }

    get name(): string { return this._config.name }
    set name(name: string) { this._config.name = name }

    get path(): string { return this._config.path! }
    set path(path: string) { this._config.path = path }

    get data(): Object { return this._config.data! }

    constructor()
    {
        Object.seal(this)
    }

    public toPreBSON(): Object
    {
        return this.toJSON()
    }

    public toJSON()
    {
        return {...this._config, id: this.id}
    }
}
