import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class AddEffectKeyframeCommand implements Command {
    constructor(
        private targetClipId: string,
        private targetEffectId: string,
        private paramName: string,
        private addedKeyframe: Delir.Entity.Keyframe,
    ) {}

    public undo(context: OperationContext) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.removeEffectKeyframe, {
            clipId: this.targetClipId,
            effectId: this.targetEffectId,
            paramName: this.paramName,
            targetKeyframeId: this.addedKeyframe.id,
        })
    }

    public redo(context: OperationContext) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.addEffectKeyframe, {
            targetClipId: this.targetClipId,
            targetEffectId: this.targetEffectId,
            paramName: this.paramName,
            keyframe: this.addedKeyframe,
        })
    }

    private focusToChangedParam(context: OperationContext) {
        context.dispatch(EditorActions.changeActiveParam, {
            target: {
                type: 'effect',
                entityId: this.targetEffectId,
                paramName: this.paramName,
            },
        })
    }
}
