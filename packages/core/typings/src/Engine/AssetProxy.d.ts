import { Asset } from '../Entity'
export default class AssetProxy {
    public readonly id: string
    /**
     * Asset file extension (without `.` prefix)
     */
    public readonly fileType: string
    public readonly name: string
    public readonly path: string
    private _asset
    constructor(_asset: Asset)
}
