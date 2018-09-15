import * as _ from 'lodash'

import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export default class ModifyClipCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Clip>

    constructor(
        private targetClipId: string,
        unpatched: Partial<Delir.Entity.Clip>,
        private patch: Partial<Delir.Entity.Clip>,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Clip>
    }

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyClipAction, {
            targetClipId: this.targetClipId,
            patch: this.toPreviousPatch,
         })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyClipAction, {
            targetClipId: this.targetClipId,
            patch: this.patch,
        })
    }
}
