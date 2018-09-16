import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { EditorActions } from '../../Editor/actions'
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
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.addEffectKeyframeAction, {
            targetClipId: this.parentClipId,
            targetEffectId: this.effectId,
            paramName: this.paramName,
            keyframe: this.removedKeyframe,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.removeEffectKeyframeAction, {
            clipId: this.parentClipId,
            effectId: this.effectId,
            targetKeyframeId: this.removedKeyframe.id,
        })
    }

    private focusToChangedParam(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveParamAction, {
            target: {
                type: 'effect',
                entityId: this.effectId,
                paramName: this.paramName,
            }
        })
    }
}
