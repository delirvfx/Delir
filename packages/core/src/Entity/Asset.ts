import uuid from 'uuid'
import { Branded } from '../helper/Branded'
import { safeAssign } from '../helper/safeAssign'

interface AssetProps {
  id?: string
  fileType: string
  name: string
  path: string
}

type AssetId = Branded<string, 'Entity/Asset/Id'>

class Asset implements AssetProps {
  public id: Asset.Id

  /** Asset file extension (without `.` prefix) */
  public fileType: string
  public name: string
  /** Full file path with schema (likes 'file:///path/to/asset.mp4) */
  public path: string

  constructor(props: AssetProps) {
    this.id = uuid.v4() as Asset.Id
    safeAssign<Asset>(this, props as AssetProps & { id: Asset.Id })
  }

  public patch(props: Partial<AssetProps>) {
    safeAssign(this, props)
  }
}

namespace Asset {
  export type Id = AssetId
}

export { Asset }
