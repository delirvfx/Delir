import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export default class AddKeyframeCommand implements Command {
    constructor(
        private targetClipId: string,
        private paramName: string,
        private addedKeyframe: Delir.Entity.Keyframe
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeKeyframeAction, {
            targetKeyframeId: this.addedKeyframe.id,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addKeyframeAction, {
            targetClipId: this.targetClipId,
            paramName: this.paramName,
            keyframe: this.addedKeyframe,
        })
    }
}
