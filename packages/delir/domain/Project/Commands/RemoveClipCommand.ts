import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveClipCommand implements Command {
    constructor(
        private parentLayerId: Delir.Entity.Layer.Id,
        private removedClip: Delir.Entity.Clip,
        private parentCompositionId: string,
    ) {}

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.addClipAction, {
            targetLayerId: this.parentLayerId,
            newClip: this.removedClip,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.removeClipAction, {
            targetClipId: this.removedClip.id,
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveCompositionAction, {
            compositionId: this.parentCompositionId,
        })
    }
}
