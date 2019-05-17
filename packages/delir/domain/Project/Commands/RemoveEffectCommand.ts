import * as Delir from '@delirvfx/core'
import { OperationContext } from '@ragg/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveEffectCommand implements Command {
    constructor(
        private holderClipId: string,
        private removedEffect: Delir.Entity.Effect,
        private beforeRemoveIndex: number,
    ) {}

    public undo(context: OperationContext<any>) {
        this.focusToParentClip(context)

        context.dispatch(ProjectActions.addEffectIntoClip, {
            clipId: this.holderClipId,
            effect: this.removedEffect,
            index: this.beforeRemoveIndex,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentClip(context)

        context.dispatch(ProjectActions.removeEffectFromClip, {
            holderClipId: this.holderClipId,
            targetEffectId: this.removedEffect.id,
        })
    }

    private focusToParentClip(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveClip, {
            clipId: this.holderClipId,
        })
    }
}
