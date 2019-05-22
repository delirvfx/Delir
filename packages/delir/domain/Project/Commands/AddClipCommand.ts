import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class AddClipCommand implements Command {
    constructor(
        private parentCompositionId: string,
        private targetLayerId: string,
        private addedClip: Delir.Entity.Clip,
    ) {}

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.removeClip, {
            targetClipId: this.addedClip.id,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.addClip, {
            targetLayerId: this.targetLayerId,
            newClip: this.addedClip,
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveComposition, {
            compositionId: this.parentCompositionId,
        })
    }
}
