import { Asset } from '../../Entity'

export default class AssetProxy {
  get id(): string {
    return this.asset.id
  }

  /**
   * Asset file extension (without `.` prefix)
   */
  get fileType(): string {
    return this.asset.fileType
  }

  get name(): string {
    return this.asset.name
  }

  get path(): string {
    return this.asset.path
  }

  constructor(private asset: Asset) {
    Object.seal(this)
  }
}
