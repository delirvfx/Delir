// @flow
import * as _ from 'lodash'

export default class Asset
{
    static deserialize(assetJson: Object)
    {
        const asset = new Asset

        asset.id = assetJson.id
        Object.assign(asset._config, _.pick(assetJson, _.keys(asset._config)))
        return asset
    }

    id: string|null = null

    private _config: {
        fileType: string,
        name: string,
        path: string|null,
        data: Object|null,
    } = {
        fileType: '',
        name: '',
        path: null,
        data: null,
    }

    get mimeType(): string { throw new Error('Asset#mimeType is abandoned') }
    set mimeType(mimeType: string) { throw new Error('Asset#mimeType is abandoned') }

    /**
     * Asset file extension (without `.` prefix)
     * @property {string} fileType
     */
    get fileType(): string { return this._config.fileType }
    set fileType(fileType: string) { this._config.fileType = fileType}

    get name(): string { return this._config.name }
    set name(name: string) { this._config.name = name }

    get path(): string { return this._config.path! }
    set path(path: string) { this._config.path = path }

    get data(): Object { return this._config.data! }

    constructor()
    {
        Object.seal(this)
    }

    toPreBSON(): Object
    {
        return this.toJSON()
    }

    toJSON()
    {
        return Object.assign({}, this._config, {id: this.id});
    }
}
