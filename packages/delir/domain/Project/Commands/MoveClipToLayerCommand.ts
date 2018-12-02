import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions }  from '../actions'

export class MoveClipToLayerCommand implements Command {
    constructor(
        private sourceLayerId: string,
        private destLayerId: string,
        private subjectClipId: string,
        private parentCompositionId: string,
    ) {}

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.moveClipToLayerAction, {
            destLayerId: this.sourceLayerId,
            clipId: this.subjectClipId,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.moveClipToLayerAction, {
            destLayerId: this.destLayerId,
            clipId: this.subjectClipId,
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveCompositionAction, {
            compositionId: this.parentCompositionId,
        })
    }
}
