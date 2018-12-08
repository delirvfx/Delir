import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveCompositionCommand implements Command {
    constructor(private removedComposition: Delir.Entity.Composition) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.createCompositionAction, {
            composition: this.removedComposition,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeCompositionAction, {
            targetCompositionId: this.removedComposition.id,
        })
    }
}
