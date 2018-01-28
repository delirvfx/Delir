import { Project } from './Document/Project'
import DocumentOperator from './DocumentOperator'
import Engine from './Engine/Engine'
import PluginRegistry from './Engine/PluginRegistry'

/**
 * Main class of one Delir context.
 *
 * This class, aggregate process module dependency and instance injection processing.
 */
export default class Delir {
    // private _rawProject: Project|null = null
    public project: DocumentOperator
    public engine: Engine
    public plugins: PluginRegistry

    public setProject(project: Project) {
        // this._rawProject = project
        this.project = new DocumentOperator(this, project)
        this.plugins = new PluginRegistry()
        this.engine = new Engine(this, this.project)
    }
}
