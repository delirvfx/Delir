import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export default class CreateCompositionCommand implements Command {
    constructor(
        private createdComposition: Delir.Entity.Composition
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeCompositionAction, {
            targetCompositionId: this.createdComposition.id,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.createCompositionAction, {
            composition: this.createdComposition,
        })
    }
}
