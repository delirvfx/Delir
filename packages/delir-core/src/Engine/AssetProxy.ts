import { Asset } from '../Entity'

export default class AssetProxy
{
    get id(): string { return this._asset.id }

    /**
     * Asset file extension (without `.` prefix)
     */
    get fileType(): string { return this._asset.fileType }

    get name(): string { return this._asset.name }

    get path(): string { return this._asset.path }

    constructor(private _asset: Asset)
    {
        Object.seal(this)
    }
}
