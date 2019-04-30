import { Branded } from '../helper/Branded'
interface AssetProps {
    id?: string
    fileType: string
    name: string
    path: string
}
declare type AssetId = Branded<string, 'Entity/Asset/Id'>
declare class Asset implements AssetProps {
    public id: Asset.Id
    /** Asset file extension (without `.` prefix) */
    public fileType: string
    public name: string
    public path: string
    constructor(props: AssetProps)
    public patch(props: Partial<AssetProps>): void
}
declare namespace Asset {
    type Id = AssetId
}
export { Asset }
