import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveEffectKeyframeCommand implements Command {
    constructor(
        private parentClipId: string,
        private effectId: string,
        private paramName: string,
        private removedKeyframe: Delir.Entity.Keyframe,
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addEffectKeyframeAction, {
            targetClipId: this.parentClipId,
            targetEffectId: this.effectId,
            paramName: this.paramName,
            keyframe: this.removedKeyframe,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeKeyframeAction, {
            targetKeyframeId: this.removedKeyframe.id,
        })
    }
}
