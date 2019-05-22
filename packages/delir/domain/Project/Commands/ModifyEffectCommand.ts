import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'
import * as _ from 'lodash'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyEffectCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Effect>

    constructor(
        private parentClipId: string,
        private targetEffectId: string,
        unpatched: Partial<Delir.Entity.Effect>,
        private patch: Partial<Delir.Entity.Effect>,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Effect>
    }

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.modifyEffect, {
            parentClipId: this.targetEffectId,
            targetEffectId: this.targetEffectId,
            patch: this.toPreviousPatch,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.modifyEffect, {
            parentClipId: this.targetEffectId,
            targetEffectId: this.targetEffectId,
            patch: this.patch,
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveComposition, {
            compositionId: this.parentClipId,
        })
    }
}
