import * as _ from 'lodash'

import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyKeyframeCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Keyframe>

    constructor(
        private targetKeyframeId: string,
        unpatched: Partial<Delir.Entity.Keyframe>,
        private patch: Partial<Delir.Entity.Keyframe>,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Keyframe>
    }

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyKeyframeAction, {
            targetKeyframeId: this.targetKeyframeId,
            patch: this.toPreviousPatch,
         })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyKeyframeAction, {
            targetKeyframeId: this.targetKeyframeId,
            patch: this.patch,
        })
    }
}
