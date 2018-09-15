import * as _ from 'lodash'

import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyLayerCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Layer>

    constructor(
        private subjectLayerId: string,
        unpatched: Partial<Delir.Entity.Layer>,
        private patch: Partial<Delir.Entity.Layer>,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Layer>
    }

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyCompositionAction, {
            targetCompositionId: this.subjectLayerId,
            patch: this.toPreviousPatch,
         })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyCompositionAction, {
            targetCompositionId: this.subjectLayerId,
            patch: this.patch,
        })
    }
}
