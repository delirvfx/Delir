import { ProjectScheme } from './scheme/project'

import { BSON } from 'bson'

import Asset from './asset'
import Composition from './composition'

export default class Project
{
    public static deserialize(projectJson: ProjectScheme)
    {
        const project = new Project()
        const assets = projectJson.assets.map(assetJson => Asset.deserialize(assetJson))
        const compositions = projectJson.compositions.map(compJson => Composition.deserialize(compJson, project))

        project.assets = assets
        project.compositions = compositions

        return project
    }

    public assets: Asset[] = []
    public compositions: Composition[] = []

    public toPreBSON()
    {
        return {
            formatVersion: '2017091401',
            assets: this.assets.map(asset => asset.toPreBSON()),
            compositions: this.compositions.map(comp => comp.toPreBSON()),
        }
    }

    public toJSON()
    {
        return {
            formatVersion: '2017091401',
            assets: this.assets.map(asset => asset.toJSON()),
            compositions: this.compositions.map(comp => comp.toJSON()),
        }
    }

    public serialize()
    {
        return (new BSON()).serialize(this.toPreBSON())
    }
}
