
import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export default class AddClipCommand implements Command {
    constructor(
        private targetLayerId: string,
        private addedClip: Delir.Entity.Clip
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeClipAction, {
            targetClipId: this.addedClip.id,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addClipAction, {
            targetLayerId: this.targetLayerId,
            newClip: this.addedClip,
        })
    }
}
