import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'
import * as _ from 'lodash'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyClipCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Clip>

    constructor(
        private parentCompositionId: string,
        private targetClipId: string,
        unpatched: Partial<Delir.Entity.Clip>,
        private patch: Partial<Delir.Entity.Clip>,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Clip>
    }

    public undo(context: OperationContext) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.modifyClip, {
            targetClipId: this.targetClipId,
            patch: this.toPreviousPatch,
        })
    }

    public redo(context: OperationContext) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.modifyClip, {
            targetClipId: this.targetClipId,
            patch: this.patch,
        })
    }

    private focusToParentComposition(context: OperationContext) {
        context.dispatch(EditorActions.changeActiveComposition, {
            compositionId: this.parentCompositionId,
        })
    }
}
