import {ProjectScheme} from './scheme/project'

import {BSON} from 'bson'

import Asset from './asset'
import Composition from './composition'

export default class Project
{
    public static deserialize(projectBson: Buffer)
    {
        const projectJson: ProjectScheme = (new BSON()).deserialize(projectBson) as ProjectScheme

        const project = new Project()
        const assets = projectJson.assets.map(assetJson => Asset.deserialize(assetJson))
        const compositions = projectJson.compositions.map(compJson => Composition.deserialize(compJson, project))

        project.assets = new Set(assets)
        project.compositions = new Set(compositions)

        return project
    }

    public assets: Set<Asset> = new Set

    public compositions: Set<Composition> = new Set

    public toPreBSON()
    {
        return {
            formatVersion: 'v0.0.0',
            assets: Array.from(this.assets.values()).map(asset => asset.toPreBSON()),
            compositions: Array.from(this.compositions.values()).map(comp => comp.toPreBSON()),
        }
    }

    public toJSON()
    {
        return {
            formatVersion: '0.0.0',
            assets: Array.from(this.assets.values()).map(asset => asset.toJSON()),
            compositions: Array.from(this.compositions.values()).map(comp => comp.toJSON()),
        }
    }

    public serialize()
    {
        return (new BSONPure.BSON()).serialize(this.toPreBSON())
    }
}
