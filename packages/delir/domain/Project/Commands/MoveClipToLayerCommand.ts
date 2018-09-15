import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions }  from '../actions'

export class MoveClipToLayerCommand implements Command {
    constructor(
        private sourceLayerId: string,
        private destLayerId: string,
        private subjectClipId: string,
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.moveClipToLayerAction, {
            destLayerId: this.sourceLayerId,
            clipId: this.subjectClipId,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.moveClipToLayerAction, {
            destLayerId: this.destLayerId,
            clipId: this.subjectClipId,
        })
    }
}
