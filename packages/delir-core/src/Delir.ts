import DocumentOperator from './DocumentOperator'

export default class Delir {
    public project: DocumentOperator
    public renderer: any

    public setProject(project: any) {
        this.project = new DocumentOperator(this, project)
    }
}
