// @flow
import Project from '../project/project'
import Asset from '../project/asset'
import Composition from '../project/composition'
import PluginRegister from '../services/plugin-registory'
import ProxySet from '../project/_proxy-set'

export default class ProjectInstanceContainer
{
    _project: Project

    get project(): Project { return this._project }
    get assets(): ProxySet<Asset> { return this._project.assets }
    get compositions(): ProxySet<Composition> { return this._project.compositions }

    constructor(project: Project, resolver)
    {
        this._project = project
    }

    resolveAsset(assetId)
    {
        return
    }

    resolveComposition(compId)
    {
        return
    }

}
