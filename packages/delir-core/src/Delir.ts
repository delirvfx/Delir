import { Project } from './Document/Project'
import DocumentOperator from './DocumentOperator'
import DocumentChangeApplyer from './Engine/DocumentChangeApplyer'
import Engine from './Engine/Engine'
import PluginRegistry from './Engine/PluginRegistry'

/**
 * Main class of one Delir context.
 *
 * This class, aggregate process module dependency and instance injection processing.
 */
export default class Delir {
    public static createProject(): Project {
        return {
            formatVersion: '1.0.0',
            assets: [],
            compositions: [],
            layers: [],
            clips: [],
            effects: [],
        }
    }

    // private _rawProject: Project|null = null
    public project: DocumentOperator
    public engine: Engine
    public plugins: PluginRegistry
    public documentChangeApplyer: DocumentChangeApplyer

    public setProject(project: Project) {
        this.project = new DocumentOperator(this, project)
        this.plugins = new PluginRegistry()
        this.engine = new Engine(this, this.project, this.plugins)
        this.documentChangeApplyer = new DocumentChangeApplyer(this.project, this.engine)
    }
}
