import Delir from './Delir'
import { Asset, Project } from './Document/index'
import { Omit } from './Utils/types'

type NewEntity<T extends { id: any }> = Omit<T, 'id'>

/**
 * Document operation methods
 */
export default class DocumentOperator {
    private context: Delir
    private project: Project

    constructor(context: Delir, project: Project) {
        this.context = context
        this.project = project
    }

    public addAsset(assetProp: NewEntity<Asset>): Asset {
        const asset = { ...assetProp, id: '' }
        this.project.assets.push(asset)
        return asset
    }

    public removeAsset(assetId: string): Asset|null {
        const index = this.project.assets.findIndex(asset => asset.id === assetId)
        if (index === -1) return null

        const [ asset ] = this.project.assets.splice(index, 1)
        return asset
    }
}
