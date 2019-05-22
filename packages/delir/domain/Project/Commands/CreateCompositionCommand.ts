import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class CreateCompositionCommand implements Command {
    constructor(private createdComposition: Delir.Entity.Composition) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeComposition, {
            targetCompositionId: this.createdComposition.id,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.createComposition, {
            composition: this.createdComposition,
        })
    }
}
