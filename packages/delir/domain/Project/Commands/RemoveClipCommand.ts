import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveClipCommand implements Command {
    constructor(
        private parentLayerId: string,
        private removedClip: Delir.Entity.Clip
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addClipAction, {
            targetLayerId: this.parentLayerId,
            newClip: this.removedClip,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeClipAction, {
            targetClipId: this.removedClip.id,
        })
    }
}
