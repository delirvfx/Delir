import * as Delir from '@delirvfx/core'
import { OperationContext } from '@ragg/fleur'

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

    public undo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.removeEffectKeyframeAction, {
            clipId: this.targetClipId,
            effectId: this.targetEffectId,
            paramName: this.paramName,
            targetKeyframeId: this.addedKeyframe.id,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.addEffectKeyframeAction, {
            targetClipId: this.targetClipId,
            targetEffectId: this.targetEffectId,
            paramName: this.paramName,
            keyframe: this.addedKeyframe,
        })
    }

    private focusToChangedParam(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveParamAction, {
            target: {
                type: 'effect',
                entityId: this.targetEffectId,
                paramName: this.paramName,
            },
        })
    }
}
