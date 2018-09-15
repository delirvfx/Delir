import * as _ from 'lodash'

import { Clip } from '@ragg/delir-core/src/Entity'
import { OperationContext } from '@ragg/fleur'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export default class ModifyClipCommand implements Command {
    private toPreviousPatch: Partial<Clip>

    constructor(
        private targetClipId: string,
        private unpatched: Partial<Clip>,
        private patch: Partial<Clip>,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Clip>
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
