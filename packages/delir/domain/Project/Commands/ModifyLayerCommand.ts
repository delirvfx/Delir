import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import * as _ from 'lodash'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyLayerCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Layer>

    constructor(
        private subjectLayerId: string,
        unpatched: Partial<Delir.Entity.Layer>,
        private patch: Partial<Delir.Entity.Layer>,
        private parentCompositionId: string,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Layer>
    }

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.modifyLayerAction, {
            targetLayerId: this.subjectLayerId,
            patch: this.toPreviousPatch,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.modifyLayerAction, {
            targetLayerId: this.subjectLayerId,
            patch: this.patch,
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveCompositionAction, {
            compositionId: this.parentCompositionId,
        })
    }
}
