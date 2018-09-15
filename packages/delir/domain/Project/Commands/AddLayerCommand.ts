import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions }  from '../actions'

export default class CreateLayerCommand implements Command {
    constructor(
        private targetCompositionId: string,
        private createdLayer: Delir.Entity.Layer,
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeLayerAction, {
            targetLayerId: this.createdLayer.id,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addLayerAction, {
            targetCompositionId: this.targetCompositionId,
            layer: this.createdLayer,
        })
    }
}
