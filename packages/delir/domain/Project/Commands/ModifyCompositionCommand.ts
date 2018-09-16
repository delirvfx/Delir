import * as _ from 'lodash'

import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyCompositionCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Composition>

    constructor(
        private subjectCompositionId: string,
        unpatched: Partial<Delir.Entity.Composition>,
        private patch: Partial<Delir.Entity.Composition>,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Composition>
    }

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyCompositionAction, {
            targetCompositionId: this.subjectCompositionId,
            patch: this.toPreviousPatch,
         })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyCompositionAction, {
            targetCompositionId: this.subjectCompositionId,
            patch: this.patch,
        })
    }
}
