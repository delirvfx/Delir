import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveCompositionCommand implements Command {
    constructor(private removedComposition: Delir.Entity.Composition) {}

    public undo(context: OperationContext) {
        context.dispatch(ProjectActions.createComposition, {
            composition: this.removedComposition,
        })
    }

    public redo(context: OperationContext) {
        context.dispatch(ProjectActions.removeComposition, {
            targetCompositionId: this.removedComposition.id,
        })
    }
}
