
import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export default class AddEffectKeyframeCommand implements Command {
    constructor(
        private targetClipId: string,
        private targetEffectId: string,
        private paramName: string,
        private addedKeyframe: Delir.Entity.Keyframe
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeEffectKeyframeAction, {
            clipId: this.targetClipId,
            effectId: this.targetEffectId,
            targetKeyframeId: this.addedKeyframe.id,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addEffectKeyframeAction, {
            targetClipId: this.targetClipId,
            targetEffectId: this.targetEffectId,
            paramName: this.paramName,
            keyframe: this.addedKeyframe,
        })
    }
}
